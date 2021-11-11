const delegationContract = artifacts.require('delegation')
const { MichelsonMap } = require('@taquito/michelson-encoder')
const vMvkTokenAddress = require('../deployments/vMvkTokenAddress')

const { alice } = require('../scripts/sandbox/accounts')
const saveContractAddress = require('../helpers/saveContractAddress')

const delegateLedger   = MichelsonMap.fromLiteral({});
const satelliteLedger  = MichelsonMap.fromLiteral({});
const adminAddress     = alice.pkh;
const configType        = {
    minimumSatelliteBond: 50000000,  // 50 vMVK in mu (10^6)
    selfBondPercentage: 10000     // 10%
};

const initialStorage = {
  admin : adminAddress,
  config : configType,
  delegateLedger : delegateLedger,
  satelliteLedger : satelliteLedger,
  vMvkTokenAddress : vMvkTokenAddress
}

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(delegationContract, initialStorage)
  const deployedContract = await delegationContract.deployed()

  await saveContractAddress('delegationAddress', deployedContract.address)
}

module.exports.initial_storage = initialStorage
