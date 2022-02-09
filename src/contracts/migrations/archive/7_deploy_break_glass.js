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
    threshold : 3,
    actionExpiryDuration: 2880,
    developerAddress : adminAddress,
    emergencyGovernanceAddress : emergencyGovernanceAddress,
};

const initialStorage = {
  admin : adminAddress,
  config : configType, 
  contractAddresses : new MichelsonMap,
  
  glassBroken : false,
  councilMembers : [],
  
  currentActionId : 0,
  nextActionId : 1,
  actionLedger : new MichelsonMap(),
  flushLedger : new MichelsonMap(),
  
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
