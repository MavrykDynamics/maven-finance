import {
  GET_GOVERNANCE_STORAGE,
  PROPOSAL_ROUND_VOTING_ERROR,
  PROPOSAL_ROUND_VOTING_REQUEST,
  PROPOSAL_ROUND_VOTING_RESULT,
  SET_GOVERNANCE_PHASE,
  SET_PAST_PROPOSALS,
  START_PROPOSAL_ROUND_ERROR,
  START_PROPOSAL_ROUND_REQUEST,
  START_PROPOSAL_ROUND_RESULT,
  START_VOTING_ROUND_ERROR,
  START_VOTING_ROUND_REQUEST,
  START_VOTING_ROUND_RESULT,
  VOTING_ROUND_VOTING_ERROR,
  VOTING_ROUND_VOTING_REQUEST,
  VOTING_ROUND_VOTING_RESULT,
  GET_CURRENT_ROUND_PROPOSALS,
} from 'pages/Governance/Governance.actions'
import {
  GovernanceConfig,
  GovernanceStorage,
  ProposalRecordType,
  CurrentRoundProposalsStorageType,
} from '../utils/TypesAndInterfaces/Governance'
import {
  PROPOSAL_UPDATE_ERROR,
  SUBMIT_FINANCIAL_DATA_REQUEST,
  PROPOSAL_UPDATE_RESULT,
} from '../pages/ProposalSubmission/ProposalSubmission.actions'
import { MichelsonMap } from '@taquito/taquito'
import { getItemFromStorage } from '../utils/storage'

const PROPOSAL = 'PROPOSAL',
  VOTING = 'VOTING',
  TIME_LOCK = 'TIME_LOCK'
export type GovernancePhase = typeof PROPOSAL | typeof VOTING | typeof TIME_LOCK
export interface GovernanceState {
  currentRoundProposals: CurrentRoundProposalsStorageType
  governanceStorage: GovernanceStorage | any
  governancePhase: GovernancePhase
  form?: any
  proposalId?: number
  pastProposals?: any
  vote?: number
  error?: any
}
const defaultgovernanceConfig: GovernanceConfig = {
  blocksPerMinute: 0,
  blocksPerProposalRound: 0,
  blocksPerTimelockRound: 0,
  blocksPerVotingRound: 0,
  maxProposalsPerDelegate: 0,
  minQuorumMvkTotal: 0,
  minQuorumPercentage: 0,
  minimumStakeReqPercentage: 0,
  newBlockTimeLevel: 0,
  newBlocksPerMinute: 0,
  proposalSubmissionFee: 0,
  successReward: 0,
  votingPowerRatio: 0,
}
const defaultGovernanceStorage: GovernanceStorage = {
  activeSatellitesMap: new MichelsonMap<string, Date>(),
  address: '',
  fee: 0,
  config: defaultgovernanceConfig,
  currentCycleEndLevel: 0,
  currentRound: '',
  currentRoundEndLevel: 0,
  currentRoundStartLevel: 0,
  nextProposalId: 0,
  proposalLedger: [],
  snapshotLedger: [],
  startLevel: 0,
  tempFlag: 0,
  timelockProposalId: 0,
  cycleCounter: 0,
  cycleHighestVotedProposalId: 0,
}
const governanceDefaultState: GovernanceState = {
  governanceStorage: getItemFromStorage('GovernanceStorage') || defaultGovernanceStorage,
  governancePhase: 'PROPOSAL',
  currentRoundProposals: [],
}

export function governance(state = governanceDefaultState, action: any): GovernanceState {
  switch (action.type) {
    case GET_CURRENT_ROUND_PROPOSALS:
      return {
        ...state,
        currentRoundProposals: action.currentRoundProposals,
      }
    case GET_GOVERNANCE_STORAGE:
      return {
        ...state,
        governanceStorage: action.governanceStorage,
      }
    case SET_GOVERNANCE_PHASE:
      return {
        ...state,
        governancePhase: action.phase,
      }
    case SET_PAST_PROPOSALS:
      return {
        ...state,
        pastProposals: action.pastProposals,
      }
    case PROPOSAL_ROUND_VOTING_REQUEST:
      return {
        ...state,
        proposalId: action.proposalId,
      }
    case PROPOSAL_ROUND_VOTING_RESULT:
      return {
        ...state,
      }
    case PROPOSAL_ROUND_VOTING_ERROR:
      return {
        ...state,
        error: action.error,
      }
    case VOTING_ROUND_VOTING_REQUEST:
      return {
        ...state,
        proposalId: action.proposalId,
      }
    case VOTING_ROUND_VOTING_RESULT:
      return {
        ...state,
      }
    case VOTING_ROUND_VOTING_ERROR:
      return {
        ...state,
        error: action.error,
      }
    case START_PROPOSAL_ROUND_REQUEST:
      return {
        ...state,
      }
    case START_PROPOSAL_ROUND_RESULT:
      return {
        ...state,
      }
    case START_PROPOSAL_ROUND_ERROR:
      return {
        ...state,
        error: action.error,
      }
    case START_VOTING_ROUND_REQUEST:
      return {
        ...state,
      }
    case START_VOTING_ROUND_RESULT:
      return {
        ...state,
      }
    case START_VOTING_ROUND_ERROR:
      return {
        ...state,
        error: action.error,
      }
    case SUBMIT_FINANCIAL_DATA_REQUEST:
      return {
        ...state,
        form: action.form,
      }
    case PROPOSAL_UPDATE_RESULT:
      return {
        ...state,
      }
    case PROPOSAL_UPDATE_ERROR:
      return {
        ...state,
        error: action.error,
      }
    default:
      return state
  }
}
