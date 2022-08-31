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
import { GovernanceStorage, CurrentRoundProposalsStorageType } from '../utils/TypesAndInterfaces/Governance'
import { PROPOSAL_UPDATE_ERROR, PROPOSAL_UPDATE_RESULT } from '../pages/ProposalSubmission/ProposalSubmission.actions'
import { GET_GOVERNANCE_SATELLITE_STORAGE } from 'pages/SatelliteGovernance/SatelliteGovernance.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import type {
  GovernanceSatelliteActionRecordGraphQL,
  GovernanceSatelliteGraphQL,
} from '../utils/TypesAndInterfaces/Governance'
import { normalizeGovernanceStorage } from '../pages/Governance/Governance.helpers'

const PROPOSAL = 'PROPOSAL',
  VOTING = 'VOTING',
  TIME_LOCK = 'TIME_LOCK'

export type GovernanceSatellite = {
  governance_satellite: GovernanceSatelliteGraphQL[]
  governance_satellite_action_record: GovernanceSatelliteActionRecordGraphQL[]
}
export type GovernancePhase = typeof PROPOSAL | typeof VOTING | typeof TIME_LOCK
export interface GovernanceState {
  currentRoundProposals: CurrentRoundProposalsStorageType
  governanceStorage: GovernanceStorage
  governancePhase: GovernancePhase
  proposalId?: number
  pastProposals: CurrentRoundProposalsStorageType
  vote?: number
  governanceSatelliteStorage: GovernanceSatellite
}

const defaultGovernanceStorage = normalizeGovernanceStorage(null)
const governanceDefaultState: GovernanceState = {
  governanceStorage: defaultGovernanceStorage,
  governancePhase: 'PROPOSAL',
  currentRoundProposals: [],
  pastProposals: [],
  governanceSatelliteStorage: {
    governance_satellite: [],
    governance_satellite_action_record: [],
  },
}

export function governance(state = governanceDefaultState, action: Action) {
  switch (action.type) {
    case GET_GOVERNANCE_SATELLITE_STORAGE:
      return {
        ...state,
        governanceSatelliteStorage: action.governanceSatelliteStorage,
      }
    case GET_CURRENT_ROUND_PROPOSALS:
      return {
        ...state,
        currentRoundProposals: action.currentRoundProposals || [],
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
