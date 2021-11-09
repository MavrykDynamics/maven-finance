const delegationContract = artifacts.require('delegation')
const { MichelsonMap } = require('@taquito/michelson-encoder')

const { alice } = require('../scripts/sandbox/accounts')
const saveContractAddress = require('../helpers/saveContractAddress')

const delegateLedger   = MichelsonMap.fromLiteral({});
const delegatorsLedger = MichelsonMap.fromLiteral({});
const adminAddress     = alice.pkh;
const configType        = {
    minimumDelegateBond: 50,
    delegationPercentage: 50
};

const initialStorage = {
  admin : adminAddress,
  config : configType,
  delegateLedger : delegateLedger,
  delegatorLedger : delegatorsLedger,
  vMvkTokenAddress : 'KT1UkahzqCvaVrVutMeTSCJqS2qBFhLjvSAk'
}

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(delegationContract, initialStorage)
  const deployedContract = await delegationContract.deployed()

  await saveContractAddress('delegationAddress', deployedContract.address)
}

module.exports.initial_storage = initialStorage
