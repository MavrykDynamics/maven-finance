const emergencyGovernanceContract = artifacts.require('emergencyGovernance')

const { MichelsonMap } = require('@taquito/michelson-encoder')

const { alice } = require('../scripts/sandbox/accounts')
const saveContractAddress = require('../helpers/saveContractAddress')

const mvkTokenAddress = require('../deployments/mvkTokenAddress')
const vMvkTokenAddress = require('../deployments/vMvkTokenAddress')

const adminAddress     = alice.pkh;
const configType        = {
    voteDuration: 2880,                    // 1 day
    minMvkPercentageForTrigger: 10000,    // 10%
    requiredFee: 10                
};

const initialStorage = {
  admin : adminAddress,
  config : configType,

  emergencyGovernanceLedger: MichelsonMap.fromLiteral({}),

  mvkTokenAddress : mvkTokenAddress,
  breakGlassContractAddress : vMvkTokenAddress,
  treasuryAddress : mvkTokenAddress, // placeholder until treasury is completed

  tempMvkTotalSupply : 0,
  currentEmergencyGovernanceId : 0,
  nextEmergencyGovernanceProposalId : 1

}

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(emergencyGovernanceContract, initialStorage)
  const deployedEmergencyGovernanceContract = await emergencyGovernanceContract.deployed()

  await saveContractAddress('emergencyGovernanceAddress', deployedEmergencyGovernanceContract.address)
}

module.exports.initial_storage = initialStorage
