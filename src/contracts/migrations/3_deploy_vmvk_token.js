const doormanContract = artifacts.require('doorman')
const vMvkTokenContract = artifacts.require('vMvkToken')
const { MichelsonMap } = require('@taquito/taquito')

const { alice } = require('../scripts/sandbox/accounts')
const saveContractAddress = require('../helpers/saveContractAddress')
const doormanAddress = require('../deployments/doormanAddress')

const initialSupply = '1000000000' // 1000 vMVK Tokens in mu (10^6)

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
    balance: initialSupply,
    allowances: new MichelsonMap(),
  },
})

const tokenMetadata = MichelsonMap.fromLiteral({
  0: {
    token_id: '0',
    token_info: MichelsonMap.fromLiteral({
      symbol: Buffer.from('vMVK').toString('hex'),
      name: Buffer.from('vMVK').toString('hex'),
      decimals: Buffer.from('6').toString('hex'),
      icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
    }),
  },
})

const initialStorage = {
  totalSupply: initialSupply,
  metadata: metadata,
  ledger: ledger,
  token_metadata: tokenMetadata,
  doormanAddress: doormanAddress,
}

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(vMvkTokenContract, initialStorage)
  const deployedVMvkToken = await vMvkTokenContract.deployed()

  // Set vMVK token address in Doorman
  const deployedDoorman = await doormanContract.deployed()
  await deployedDoorman.setVMvkTokenAddress(deployedVMvkToken.address)

  await saveContractAddress('vMvkTokenAddress', deployedVMvkToken.address)
}

module.exports.initial_storage = initialStorage
