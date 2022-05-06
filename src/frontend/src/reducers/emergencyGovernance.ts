import { MichelsonMap } from '@taquito/taquito'
import { GET_EMERGENCY_GOVERNANCE_STORAGE } from '../pages/Governance/Governance.actions'

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
  nextEmergencyGovernanceId: number
}
export interface EmergencyGovernanceState {
  emergencyGovernanceStorage: EmergencyGovernanceStorage | any
}

const emergencyGovernanceDefaultState: EmergencyGovernanceState = {
  emergencyGovernanceStorage: {},
}

export function emergencyGovernance(state = emergencyGovernanceDefaultState, action: any): EmergencyGovernanceState {
  switch (action.type) {
    case GET_EMERGENCY_GOVERNANCE_STORAGE:
      return {
        emergencyGovernanceStorage: action.emergencyGovernanceStorage,
      }
    default:
      return state
  }
}
