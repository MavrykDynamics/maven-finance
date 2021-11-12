const sMvkTokenContract = artifacts.require('sMvkToken')
const { MichelsonMap } = require('@taquito/taquito')

const { alice } = require('../scripts/sandbox/accounts')
const saveContractAddress = require('../helpers/saveContractAddress')
// const delegationAddress = require('../deployments/doormanAddress') // use doormanAddress for now temporarily until delegation contract is set up

const initialSupply = '1000000000' // 1000 sMVK Tokens in mu (10^6)

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

const ledger = new MichelsonMap();

const tokenMetadata = MichelsonMap.fromLiteral({
  0: {
    token_id: '0',
    token_info: MichelsonMap.fromLiteral({
      symbol: Buffer.from('sMVK').toString('hex'),
      name: Buffer.from('sMVK').toString('hex'),
      decimals: Buffer.from('6').toString('hex'),
      icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
    }),
  },
})

const initialStorage = {
  admin             : alice.pkh,
  totalSupply       : initialSupply,
  metadata          : metadata,
  ledger            : ledger,
  token_metadata    : tokenMetadata,
  delegationAddress : 'KT1UkahzqCvaVrVutMeTSCJqS2qBFhLjvSAk', // to be replaced
}

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(sMvkTokenContract, initialStorage)
  const deployedSMvkToken = await sMvkTokenContract.deployed()

//   Set vMVK token address in Doorman - change to delegationAddress in future once it is deployed
//   const deployedDoorman = await doormanContract.deployed()
//   await deployedDoorman.setVMvkTokenAddress(deployedVMvkToken.address)

  await saveContractAddress('sMvkTokenAddress', deployedSMvkToken.address)
}

module.exports.initial_storage = initialStorage
