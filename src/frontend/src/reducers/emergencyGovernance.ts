import {
  GET_EMERGENCY_GOVERNANCE_STORAGE,
  SET_EMERGENCY_GOVERNANCE_ACTIVE,
  SET_HAS_ACKNOWLEDGED_EMERGENCY_GOV,
  SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_ERROR,
  SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_REQUEST,
  SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_RESULT,
} from '../pages/EmergencyGovernance/EmergencyGovernance.actions'
import { EmergencyGovernanceStorage } from '../utils/TypesAndInterfaces/EmergencyGovernance'
import { getItemFromStorage } from '../utils/storage'

export interface EmergencyGovernanceState {
  type?: typeof GET_EMERGENCY_GOVERNANCE_STORAGE | typeof SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_REQUEST
  emergencyGovernanceStorage: EmergencyGovernanceStorage | any
  emergencyGovActive: boolean
  hasAcknowledgeEmergencyGovernance: boolean
  emergencyGovernanceProposal?: any
  error?: any
}

const defaultEmergencyGovernanceStorage: EmergencyGovernanceStorage = {
  address: '',
  config: {
    minStakedMvkRequiredToTrigger: 0,
    minStakedMvkRequiredToVote: 0,
    requiredFeeMutez: 10,
    voteExpiryDays: 3,
    sMvkPercentageRequired: 0,
    proposalTitleMaxLength: 400,
    proposalDescMaxLength: 400,
    decimals: 4,
  },
  currentEmergencyGovernanceRecordId: 0,
  emergencyGovernanceLedger: [],
  nextEmergencyGovernanceRecordId: 0,
}
const emergencyGovernanceDefaultState: EmergencyGovernanceState = {
  emergencyGovernanceStorage: getItemFromStorage('EmergencyGovernanceStorage') || defaultEmergencyGovernanceStorage,
  emergencyGovActive: false,
  hasAcknowledgeEmergencyGovernance: false,
}

export function emergencyGovernance(state = emergencyGovernanceDefaultState, action: any): EmergencyGovernanceState {
  switch (action.type) {
    case GET_EMERGENCY_GOVERNANCE_STORAGE:
      return {
        ...state,
        type: GET_EMERGENCY_GOVERNANCE_STORAGE,
        emergencyGovernanceStorage: action.emergencyGovernanceStorage,
      }
    case SET_EMERGENCY_GOVERNANCE_ACTIVE:
      return {
        ...state,
        emergencyGovActive: action.emergencyGovActive,
      }
    case SET_HAS_ACKNOWLEDGED_EMERGENCY_GOV:
      return {
        ...state,
        hasAcknowledgeEmergencyGovernance: action.hasAcknowledgeEmergencyGovernance,
      }
    case SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_REQUEST:
      return {
        ...state,
        type: SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_REQUEST,
        emergencyGovernanceProposal: action.form,
      }
    case SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_RESULT:
      return {
        ...state,
        type: SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_REQUEST,
      }
    case SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_ERROR:
      return {
        ...state,
        type: SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_REQUEST,
        error: action.error,
      }
    default:
      return state
  }
}
