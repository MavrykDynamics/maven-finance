const delegationContract = artifacts.require('delegation')
const vMvkTokenContract = artifacts.require('vMvkToken')
const doormanContract = artifacts.require('doorman')

const { MichelsonMap } = require('@taquito/michelson-encoder')

const { alice } = require('../scripts/sandbox/accounts')
const saveContractAddress = require('../helpers/saveContractAddress')
const vMvkTokenAddress = require('../deployments/vMvkTokenAddress')
const doormanAddress = require('../deployments/doormanAddress')

const delegateLedger   = MichelsonMap.fromLiteral({});
const satelliteLedger  = MichelsonMap.fromLiteral({});
const adminAddress     = alice.pkh;
const configType        = {
    minimumStakedMvkBalance: 100,  // 100,000 vMVK in mu (10^6)
    delegationRatio: 10_000,                   // 10%
    maxSatellites: 100                         // max number of satellites
};
const breakGlassConfigType = {
    delegateToSatelliteIsPaused           : false,
    undelegateFromSatelliteIsPaused         : false,
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
  // vMvkTokenAddress : vMvkTokenAddress,
  doormanAddress: doormanAddress,
  governanceAddress : vMvkTokenAddress // update on governance deployment
}

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(delegationContract, initialStorage)
  const deployedDelegationContract = await delegationContract.deployed()

  //   Set delegation address in vMVK
  // const deployedVMvkToken = await vMvkTokenContract.deployed()
  // await deployedVMvkToken.setDelegationTokenAddress(deployedDelegationContract.address)

  // Set delegation address in Doorman
  const deployedDoorman = await doormanContract.deployed()
  await deployedDoorman.setDelegationAddress(deployedDelegationContract.address)

  await saveContractAddress('delegationAddress', deployedDelegationContract.address)
}

module.exports.initial_storage = initialStorage
