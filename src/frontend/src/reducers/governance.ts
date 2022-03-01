import {
  GET_GOVERNANCE_STORAGE,
  PROPOSAL_ROUND_VOTING_ERROR,
  PROPOSAL_ROUND_VOTING_REQUEST,
  PROPOSAL_ROUND_VOTING_RESULT,
  SET_GOVERNANCE_PHASE,
  SET_PAST_PROPOSALS,
  VOTING_ROUND_VOTING_ERROR,
  VOTING_ROUND_VOTING_REQUEST,
  VOTING_ROUND_VOTING_RESULT,
} from 'pages/Governance/Governance.actions'
import { GovernanceStorage } from '../utils/TypesAndInterfaces/Governance'

const PROPOSAL = 'PROPOSAL',
  VOTING = 'VOTING',
  TIME_LOCK = 'TIME_LOCK'
export type GovernancePhase = typeof PROPOSAL | typeof VOTING | typeof TIME_LOCK
export interface GovernanceState {
  governanceStorage: GovernanceStorage | any
  governancePhase: GovernancePhase
  proposalId?: number
  pastProposals?: any
  vote?: number
  error?: any
}

const governanceDefaultState: GovernanceState = {
  governanceStorage: {},
  governancePhase: 'PROPOSAL',
}

export function governance(state = governanceDefaultState, action: any): GovernanceState {
  switch (action.type) {
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
    case SET_PAST_PROPOSALS:
      return {
        ...state,
        pastProposals: action.pastProposals,
      }
    default:
      return state
  }
}
