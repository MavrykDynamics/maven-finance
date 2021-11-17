const delegationContract = artifacts.require('delegation')
const vMvkTokenContract = artifacts.require('vMvkToken')
const sMvkTokenContract = artifacts.require('sMvkToken')
const doormanContract = artifacts.require('doorman')

const { MichelsonMap } = require('@taquito/michelson-encoder')

const { alice } = require('../scripts/sandbox/accounts')
const saveContractAddress = require('../helpers/saveContractAddress')
const vMvkTokenAddress = require('../deployments/vMvkTokenAddress')
const sMvkTokenAddress = require('../deployments/sMvkTokenAddress')

const delegateLedger   = MichelsonMap.fromLiteral({});
const satelliteLedger  = MichelsonMap.fromLiteral({});
const adminAddress     = alice.pkh;
const configType        = {
    minimumSatelliteBond: 250000000,  // 50 vMVK in mu (10^6)
    selfBondPercentage: 10000     // 10%
};
const breakGlassConfigType = {
    setSatelliteIsPaused           : false,
    unsetSatelliteIsPaused         : false,
    registerAsSatelliteIsPaused    : false,
    unregisterAsSatelliteIsPaused  : false,
    updateSatelliteRecordIsPaused  : false
}

const initialStorage = {
  admin : adminAddress,
  config : configType,
  breakGlassConfig: breakGlassConfigType,
  delegateLedger : delegateLedger,
  satelliteLedger : satelliteLedger,
  vMvkTokenAddress : vMvkTokenAddress,
  sMvkTokenAddress : sMvkTokenAddress,
}

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(delegationContract, initialStorage)
  const deployedDelegationContract = await delegationContract.deployed()

  //   Set delegation address in sMVK 
  const deployedSMvkToken = await sMvkTokenContract.deployed()
  await deployedSMvkToken.setDelegationTokenAddress(deployedDelegationContract.address)

  //   Set delegation address in vMVK
  const deployedVMvkToken = await vMvkTokenContract.deployed()
  await deployedVMvkToken.setDelegationTokenAddress(deployedDelegationContract.address)

  // Set delegation address in Doorman
  const deployedDoorman = await doormanContract.deployed()
  await deployedDoorman.setDelegationAddress(deployedDelegationContract.address)

  await saveContractAddress('delegationAddress', deployedDelegationContract.address)
}

module.exports.initial_storage = initialStorage
