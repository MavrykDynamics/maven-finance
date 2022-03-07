import { MichelsonMap } from '@taquito/taquito'
import {
  GET_EMERGENCY_GOVERNANCE_STORAGE,
  SET_EMERGENCY_GOVERNANCE_ACTIVE,
  SET_HAS_ACKNOWLEDGED_EMERGENCY_GOV,
} from '../pages/EmergencyGovernance/EmergencyGovernance.actions'

export interface EmergencyGovernanceStorage {
  admin: string
  config: {
    voteDuration: number
    minStakedMvkPercentageForTrigger: number
    requiredFee: number
  }
  generalContracts: MichelsonMap<string, unknown>
  emergencyGovernanceLedger: MichelsonMap<string, unknown>
  tempMvkTotalSupply: number
  currentEmergencyGovernanceId: number
  nextEmergencyGovernanceProposalId: number
}
export interface EmergencyGovernanceState {
  emergencyGovernanceStorage: EmergencyGovernanceStorage | any
  emergencyGovActive: boolean
  hasAcknowledgeEmergencyGovernance: boolean
}

const emergencyGovernanceDefaultState: EmergencyGovernanceState = {
  emergencyGovernanceStorage: {},
  emergencyGovActive: false,
  hasAcknowledgeEmergencyGovernance: false,
}

export function emergencyGovernance(state = emergencyGovernanceDefaultState, action: any): EmergencyGovernanceState {
  switch (action.type) {
    case GET_EMERGENCY_GOVERNANCE_STORAGE:
      return {
        ...state,
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
    default:
      return state
  }
}
