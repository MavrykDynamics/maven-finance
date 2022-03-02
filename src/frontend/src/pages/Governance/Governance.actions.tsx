import { State } from '../../reducers'
import governanceAddress from '../../deployments/governanceAddress.json'
import emergencyGovernanceAddress from '../../deployments/emergencyGovernanceAddress.json'
import { MichelsonMap, TezosToolkit } from '@taquito/taquito'
import { getContractBigmapKeys } from '../../utils/api'
import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import { GovernanceStorage, ProposalRecordType, SnapshotRecordType } from '../../utils/TypesAndInterfaces/Governance'

export const SET_GOVERNANCE_PHASE = 'SET_GOVERNANCE_PHASE'
export const GET_GOVERNANCE_STORAGE = 'GET_GOVERNANCE_STORAGE'
export const SET_PAST_PROPOSALS = 'SET_PAST_PROPOSALS'
export const getGovernanceStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(governanceAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(governanceAddress.address)

  const storage = await (contract as any).storage()
  const proposalLedgerBigMap = await getContractBigmapKeys(governanceAddress.address, 'proposalLedger')
  const snapshotLedgerBigMap = await getContractBigmapKeys(governanceAddress.address, 'snapshotLedger')
  const financialRequestLedgerBigMap = await getContractBigmapKeys(governanceAddress.address, 'financialRequestLedger')
  const financialRequestSnapshotLedgerBigMap = await getContractBigmapKeys(
    governanceAddress.address,
    'financialRequestSnapshotLedger',
  )
  const governanceLambdaLedgerBigMap = await getContractBigmapKeys(governanceAddress.address, 'governanceLambdaLedger')

  const proposalLedger = new MichelsonMap<string, ProposalRecordType>()
  proposalLedgerBigMap.forEach((item: any, index: number) => {
    const newEntry = item.value as ProposalRecordType
    newEntry.id = Number(item.key)
    newEntry.votedMVK =
      item.value?.passVoteMvkTotal +
      item.value?.upvoteMvkTotal +
      item.value?.abstainMvkTotal +
      item.value?.downvoteMvkTotal +
      proposalLedger.set(item.key, newEntry)
  })

  const snapshotLedger = new MichelsonMap<string, SnapshotRecordType>()
  let totalVotingPower = 0
  snapshotLedgerBigMap.forEach((item: any, index: number) => {
    const newEntry = item.value as SnapshotRecordType
    totalVotingPower += newEntry.totalVotingPower
    snapshotLedger.set(item.key, newEntry)
  })

  // Getting all proposals for the current round
  const currentRoundProposals = new MichelsonMap<string, ProposalRecordType>()
  const currRoundPropMap = await storage.currentRoundProposals
  currRoundPropMap.forEach((value: number, key: string) => {
    const proposalItemFromProposalLedger = proposalLedger.get(key)
    if (proposalItemFromProposalLedger) {
      proposalItemFromProposalLedger.votedMVK = value
      currentRoundProposals.set(key, proposalItemFromProposalLedger)
    }
  })

  // Getting all past proposals
  const pastProposals = new MichelsonMap<string, ProposalRecordType>()
  proposalLedger.forEach((value: ProposalRecordType, key: string) => {
    const proposalItemFromProposalLedger = proposalLedger.get(key)
    if (
      proposalItemFromProposalLedger &&
      proposalItemFromProposalLedger.currentCycleEndLevel < storage.currentCycleEndLevel.toNumber()
    ) {
      pastProposals.set(key, proposalItemFromProposalLedger)
    }
  })

  const governanceStorage: GovernanceStorage = {
    admin: storage.admin,
    config: {
      successReward: storage.config.successReward.toNumber(),
      minQuorumPercentage: storage.config.minQuorumPercentage,
      minQuorumMvkTotal: storage.config.minQuorumPercentage,
      votingPowerRatio: storage.config.votingPowerRatio,
      proposalSubmissionFee: storage.config.proposalSubmissionFee, // 10 tez
      minimumStakeReqPercentage: storage.config.minimumStakeReqPercentage, // 0.01% for testing: change to 10,000 later -> 10%
      maxProposalsPerDelegate: storage.config.maxProposalsPerDelegate,
      newBlockTimeLevel: storage.config.newBlockTimeLevel,
      newBlocksPerMinute: storage.config.newBlocksPerMinute,
      blocksPerMinute: storage.config.blocksPerMinute,
      blocksPerProposalRound: storage.config.blocksPerProposalRound,
      blocksPerVotingRound: storage.config.blocksPerVotingRound,
      blocksPerTimelockRound: storage.config.blocksPerTimelockRound,
    },
    whitelistContracts: storage.whitelistContracts,
    whitelistTokenContracts: storage.whitelistTokenContracts,
    generalContracts: storage.generalContracts,
    proposalLedger: proposalLedger,
    snapshotLedger: snapshotLedger,
    activeSatellitesMap: storage.activeSatellitesMap as MichelsonMap<string, Date>,
    startLevel: storage.startLevel.toNumber(),
    nextProposalId: storage.nextProposalId.toNumber(),
    currentRound: storage.currentRound,
    currentRoundStartLevel: storage.currentRoundStartLevel.toNumber(),
    currentRoundEndLevel: storage.currentRoundEndLevel.toNumber(),
    currentCycleEndLevel: storage.currentCycleEndLevel.toNumber(),
    currentRoundProposals: currentRoundProposals,
    currentRoundVotes: storage.currentRoundVotes,
    currentRoundHighestVotedProposalId: storage.currentRoundHighestVotedProposalId.toNumber(),
    timelockProposalId: storage.timelockProposalId.toNumber(),
    snapshotMvkTotalSupply: storage.snapshotMvkTotalSupply.toNumber(),
    governanceLambdaLedger: governanceLambdaLedgerBigMap,
    financialRequestLedger: financialRequestLedgerBigMap,
    financialRequestSnapshotLedger: financialRequestSnapshotLedgerBigMap,
    financialRequestCounter: storage.financialRequestCounter.toNumber(),
    tempFlag: storage.tempFlag.toNumber(),
  }

  console.log('Printing out Governance storage:\n', governanceStorage)

  dispatch({
    type: GET_GOVERNANCE_STORAGE,
    governanceStorage: governanceStorage,
  })

  let govPhase
  switch (governanceStorage.currentRound) {
    case 'proposal':
      govPhase = 'PROPOSAL'
      break
    case 'voting':
      govPhase = 'VOTING'
      break
    default:
      govPhase = 'TIME_LOCK'
      break
  }
  dispatch({
    type: SET_GOVERNANCE_PHASE,
    phase: govPhase,
  })
  dispatch({ type: SET_PAST_PROPOSALS, pastProposals: pastProposals })
}

export const GET_EMERGENCY_GOVERNANCE_STORAGE = 'GET_EMERGENCY_GOVERNANCE_STORAGE'
export const SET_EMERGENCY_GOVERNANCE_ACTIVE = 'SET_EMERGENCY_GOVERNANCE_ACTIVE'
export const SET_HAS_ACKNOWLEDGED_EMERGENCY_GOV = 'SET_HAS_ACKNOWLEDGED_EMERGENCY_GOV'
export const getEmergencyGovernanceStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(emergencyGovernanceAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(emergencyGovernanceAddress.address)

  const storage = await (contract as any).storage()
  console.log('Printing out Emergency Governance storage:\n', storage)
  const currentEmergencyGovernanceId = storage.currentEmergencyGovernanceId

  dispatch({
    type: SET_EMERGENCY_GOVERNANCE_ACTIVE,
    emergencyGovActive: currentEmergencyGovernanceId.toNumber() !== 0,
  })
  dispatch({
    type: GET_EMERGENCY_GOVERNANCE_STORAGE,
    emergencyGovernanceStorage: storage,
  })
}

export const PROPOSAL_ROUND_VOTING_REQUEST = 'PROPOSAL_ROUND_VOTING_REQUEST'
export const PROPOSAL_ROUND_VOTING_RESULT = 'PROPOSAL_ROUND_VOTING_RESULT'
export const PROPOSAL_ROUND_VOTING_ERROR = 'PROPOSAL_ROUND_VOTING_ERROR'
export const proposalRoundVote = (proposalId: number) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    const contract = await state.wallet.tezos?.wallet.at(governanceAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.proposalRoundVote(proposalId).send()
    console.log('transaction', transaction)

    dispatch({
      type: PROPOSAL_ROUND_VOTING_REQUEST,
      proposalId: proposalId,
    })
    dispatch(showToaster(INFO, 'Proposal Vote executing...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))

    dispatch({
      type: PROPOSAL_ROUND_VOTING_RESULT,
    })

    dispatch(getGovernanceStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: PROPOSAL_ROUND_VOTING_ERROR,
      error,
    })
  }
}

export const VOTING_ROUND_VOTING_REQUEST = 'VOTING_ROUND_VOTING_REQUEST'
export const VOTING_ROUND_VOTING_RESULT = 'VOTING_ROUND_VOTING_RESULT'
export const VOTING_ROUND_VOTING_ERROR = 'VOTING_ROUND_VOTING_ERROR'
export const votingRoundVote = (vote: number) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    const contract = await state.wallet.tezos?.wallet.at(governanceAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.votingRoundVote(vote).send()
    console.log('transaction', transaction)

    dispatch({
      type: VOTING_ROUND_VOTING_REQUEST,
      vote: vote,
    })
    dispatch(showToaster(INFO, 'Voting...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))

    dispatch({
      type: VOTING_ROUND_VOTING_RESULT,
    })

    dispatch(getGovernanceStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: VOTING_ROUND_VOTING_ERROR,
      error,
    })
  }
}

// export const START_PROPOSAL_ROUND_REQUEST = 'START_PROPOSAL_ROUND_REQUEST'
// export const START_PROPOSAL_ROUND_RESULT = 'START_PROPOSAL_ROUND_RESULT'
// export const START_PROPOSAL_ROUND_ERROR = 'START_PROPOSAL_ROUND_ERROR'

export const START_PROPOSAL_ROUND_REQUEST = 'START_PROPOSAL_ROUND_REQUEST'
export const START_PROPOSAL_ROUND_RESULT = 'VOTING_ROUND_VOTING_RESULT'
export const START_PROPOSAL_ROUND_ERROR = 'VOTING_ROUND_VOTING_ERROR'
export const startProposalRound = () => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    const contract = await state.wallet.tezos?.wallet.at(governanceAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.startProposalRound().send()
    console.log('transaction', transaction)

    dispatch({
      type: START_PROPOSAL_ROUND_REQUEST,
    })
    dispatch(showToaster(INFO, 'Request Proposal round start...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))

    dispatch({
      type: START_PROPOSAL_ROUND_RESULT,
    })

    dispatch(getGovernanceStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: START_PROPOSAL_ROUND_ERROR,
      error,
    })
  }
}

export const START_VOTING_ROUND_REQUEST = 'START_VOTING_ROUND_REQUEST'
export const START_VOTING_ROUND_RESULT = 'START_VOTING_ROUND_RESULT'
export const START_VOTING_ROUND_ERROR = 'START_VOTING_ROUND_ERROR'
export const startVotingRound = () => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    const contract = await state.wallet.tezos?.wallet.at(governanceAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.startProposalRound().send()
    console.log('transaction', transaction)

    dispatch({
      type: START_VOTING_ROUND_REQUEST,
    })
    dispatch(showToaster(INFO, 'Request Voting round start...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))

    dispatch({
      type: START_VOTING_ROUND_RESULT,
    })

    dispatch(getGovernanceStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: START_VOTING_ROUND_ERROR,
      error,
    })
  }
}
