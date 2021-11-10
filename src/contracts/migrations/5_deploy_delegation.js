const delegationContract = artifacts.require('delegation')
const { MichelsonMap } = require('@taquito/michelson-encoder')
const vMvkTokenAddress = require('../deployments/vMvkTokenAddress')

const { alice } = require('../scripts/sandbox/accounts')
const saveContractAddress = require('../helpers/saveContractAddress')

const delegateLedger   = MichelsonMap.fromLiteral({});
const delegatorsLedger = MichelsonMap.fromLiteral({});
const adminAddress     = alice.pkh;
const configType        = {
    minimumDelegateBond: 50000000,  // 50 vMVK in mu (10^6)
    delegationPercentage: 10000     // 10%
};

const initialStorage = {
  admin : adminAddress,
  config : configType,
  delegateLedger : delegateLedger,
  delegatorLedger : delegatorsLedger,
  vMvkTokenAddress : vMvkTokenAddress
}

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(delegationContract, initialStorage)
  const deployedContract = await delegationContract.deployed()

  await saveContractAddress('delegationAddress', deployedContract.address)
}

module.exports.initial_storage = initialStorage
