const breakGlassContract = artifacts.require('breakGlass')
const emergencyGovernanceContract = artifacts.require('emergencyGovernance')

const { MichelsonMap } = require('@taquito/michelson-encoder')

const { alice } = require('../scripts/sandbox/accounts')
const saveContractAddress = require('../helpers/saveContractAddress')

const emergencyGovernanceAddress = require('../deployments/emergencyGovernanceAddress')
const mvkTokenAddress = require('../deployments/mvkTokenAddress')
const delegationAddress = require('../deployments/delegationAddress')
const doormanAddress = require('../deployments/doormanAddress')
const governanceAddress = require('../deployments/governanceAddress')

const adminAddress     = alice.pkh;
const configType        = {
    doormanContractAddress: doormanAddress,                   
    delegationContractAddress: delegationAddress,   
    governanceContractAddress: governanceAddress                
};

const initialStorage = {
  admin : adminAddress,
  config : configType, 
  developerAddress : adminAddress,
  emergencyGovernanceAddress : emergencyGovernanceAddress,
  glassBroken : false,
  councilMembers : [],
  threshold : 3,
  currentActionId : 0,
  nextActionId : 1,
  actionLedger : new MichelsonMap(),
  flushLedger : new MichelsonMap(),
  actionExpiryDuration: 2880
}

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(breakGlassContract, initialStorage)
  const deployedBreakGlassContract = await breakGlassContract.deployed()

  // set break glass contract address in emergency governance contract
  const deployedEmergencyGovernanceContract = await emergencyGovernanceContract.deployed()
  await deployedEmergencyGovernanceContract.setBreakGlassContractAddress(deployedBreakGlassContract.address)

  await saveContractAddress('breakGlassAddress', deployedBreakGlassContract.address)
}

module.exports.initial_storage = initialStorage
