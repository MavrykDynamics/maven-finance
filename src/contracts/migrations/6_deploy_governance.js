const governanceContract = artifacts.require('governance')
// const vMvkTokenContract = artifacts.require('vMvkToken')
// const sMvkTokenContract = artifacts.require('sMvkToken')
// const doormanContract = artifacts.require('doorman')

const { MichelsonMap, UnitValue } = require('@taquito/michelson-encoder')

const { alice } = require('../scripts/sandbox/accounts')
const saveContractAddress = require('../helpers/saveContractAddress')
const mvkTokenAddress = require('../deployments/mvkTokenAddress')
const delegationAddress = require('../deployments/delegationAddress')
const { Tezos } = require('@taquito/taquito')

const proposalLedger   = MichelsonMap.fromLiteral({});
const snapshotLedger  = MichelsonMap.fromLiteral({});
const adminAddress     = alice.pkh;
const configType        = {

    successReward: 1000_000_000,            // 1000 vMVK in mu (10^6)
    minQuorumPercentage: 500,               // 5%
    proposalSubmissionFee: 10_000_000,      // 10 tez in mu
    
    minimumStakeReqPercentage: 100,         // 1%
    maxProposalsPerDelegate: 10,
    
    timelockDuration: 5760,                 // 2 days
    
    newBlockTimeLevel: 0,
    newBlocksPerMinute: 0,
    blocksPerMinute: 2,
    
    blocksPerProposalPeriod: 14400,         // 5 days
    blocksPerVotingPeriod: 14400            // 5 days 
};

// const breakGlassConfigType = {
//     setSatelliteIsPaused           : false,
//     unsetSatelliteIsPaused         : false,
//     registerAsSatelliteIsPaused    : false,
//     unregisterAsSatelliteIsPaused  : false,
//     updateSatelliteRecordIsPaused  : false
// }

const initialStorage = {
  admin : adminAddress,
  config : configType,

//   breakGlassConfig: breakGlassConfigType,

  proposalLedger : proposalLedger,
  snapshotLedger : snapshotLedger,

  satelliteSet : [],

  startLevel : 1,
  nextProposalId : 1,

  currentRound : 'proposal',
  currentRoundStartLevel : 1,
  currentRoundEndLevel : 14401,

//   currentProposalCheck : UnitValue,
//   currentTimelockCheck : UnitValue,

  currentProposalCheck : 0,
  currentTimelockCheck : 0,

  mvkTokenAddress : mvkTokenAddress,
  delegationAddress : delegationAddress,
  
  snapshotMvkTotalSupply : 1

}

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(governanceContract, initialStorage)
  const deployedGovernanceContract = await governanceContract.deployed()

  await saveContractAddress('governanceAddress', deployedGovernanceContract.address)
}

module.exports.initial_storage = initialStorage
