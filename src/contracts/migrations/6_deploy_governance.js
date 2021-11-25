const governanceContract = artifacts.require('governance')
// const vMvkTokenContract = artifacts.require('vMvkToken')
// const sMvkTokenContract = artifacts.require('sMvkToken')
const delegationContract = artifacts.require('delegation')

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
    minQuorumMvkTotal: 0,                   // will be recalculated when proposal round starts
    votingPowerRatio: 10_000,               // 10% 
    proposalSubmissionFee: 10_000_000,      // 10 tez in mu
    minimumStakeReqPercentage: 100,         // 1%
    maxProposalsPerDelegate: 10,
    timelockDuration: 5760,                 // 2 days
    newBlockTimeLevel: 0,
    newBlocksPerMinute: 0,
    blocksPerMinute: 2,
    blocksPerProposalRound: 14400,         // 5 days
    blocksPerVotingRound: 14400            // 5 days 
};

const initialStorage = {
  admin : adminAddress,
  config : configType,
  proposalLedger : proposalLedger,
  snapshotLedger : snapshotLedger,
  activeSatellitesMap : new MichelsonMap(),
  startLevel : 1,
  nextProposalId : 1,
  currentRound : 'proposal',
  currentRoundStartLevel : 1,
  currentRoundEndLevel : 14401,
  currentCycleEndLevel : 28801,
  currentRoundProposals : new MichelsonMap(),
  currentRoundVotes     : new MichelsonMap(),
  currentRoundHighestVotedProposalId : 0,
  currentRoundTimelockProposalId : 0,
  mvkTokenAddress : mvkTokenAddress,
  delegationAddress : delegationAddress,
  snapshotMvkTotalSupply : 1
}

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(governanceContract, initialStorage)
  const deployedGovernanceContract = await governanceContract.deployed()

  // set governance address in delegation contract
  const deployedDelegationContract = await delegationContract.deployed()
  await deployedDelegationContract.setGovernanceAddress(deployedGovernanceContract.address)

  await deployedGovernanceContract.setDelegationAddress(deployedDelegationContract.address)

  await saveContractAddress('governanceAddress', deployedGovernanceContract.address)
}

module.exports.initial_storage = initialStorage
