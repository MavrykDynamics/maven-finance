const doormanContract = artifacts.require('doorman')
const mvkTokenContract = artifacts.require('mvkToken')
const { MichelsonMap } = require('@taquito/taquito')

const { alice, bob, eve, mallory } = require('../scripts/sandbox/accounts')
const saveContractAddress = require('../helpers/saveContractAddress')
const doormanAddress = require('../deployments/doormanAddress')

const initialSupply = '1000000000' // 1,000 MVK Tokens in mu (10^6)

const metadata = MichelsonMap.fromLiteral({
  '': Buffer('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer(
    JSON.stringify({
      version: 'v1.0.0',
      description: 'MAVRYK Token',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
      source: {
        tools: ['Ligo', 'Flextesa'],
        location: 'https://ligolang.org/',
      },
      interfaces: ['TZIP-7', 'TZIP-16'],
      errors: [],
      views: [],
    }),
    'ascii',
  ).toString('hex'),
})

const ledger = MichelsonMap.fromLiteral({
  [alice.pkh]: {
    balance: initialSupply / 4,
    allowances: new MichelsonMap(),
  },
  [bob.pkh]: {
    balance: initialSupply / 4,
    allowances: new MichelsonMap(),
  },
  [eve.pkh]: {
    balance: initialSupply / 4,
    allowances: new MichelsonMap(),
  },
  [mallory.pkh]: {
    balance: initialSupply / 4,
    allowances: new MichelsonMap(),
  },
})

const tokenMetadata = MichelsonMap.fromLiteral({
  0: {
    token_id: '0',
    token_info: MichelsonMap.fromLiteral({
      symbol: Buffer.from('MVK').toString('hex'),
      name: Buffer.from('MAVRYK').toString('hex'),
      decimals: Buffer.from('6').toString('hex'),
      icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
    }),
  },
})

const initialStorage = {
  totalSupply       : initialSupply,
  metadata          : metadata,
  ledger            : ledger,
  token_metadata    : tokenMetadata,
  doormanAddress    : doormanAddress,
}

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(mvkTokenContract, initialStorage)
  const deployedMvkToken = await mvkTokenContract.deployed()

  // Set MVK token address in Doorman
  const deployedDoorman = await doormanContract.deployed()
  await deployedDoorman.setMvkTokenAddress(deployedMvkToken.address)

  await saveContractAddress('mvkTokenAddress', deployedMvkToken.address)
}

module.exports.initial_storage = initialStorage
