import { GET_GOVERNANCE_STORAGE } from 'pages/Governance/Governance.actions'
import { GovernanceStorage } from '../utils/TypesAndInterfaces/Governance'

const PROPOSAL = 'PROPOSAL',
  VOTING = 'VOTING',
  TIME_LOCK = 'TIME_LOCK'
export type GovernancePhase = typeof PROPOSAL | typeof VOTING | typeof TIME_LOCK
export const SET_GOVERNANCE_PHASE = 'SET_GOVERNANCE_PHASE'
export interface GovernanceState {
  governanceStorage: GovernanceStorage | any
  governancePhase: GovernancePhase
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
    default:
      return state
  }
}
