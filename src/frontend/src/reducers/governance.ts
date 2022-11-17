import {
  GET_GOVERNANCE_STORAGE,
  SET_GOVERNANCE_PHASE,
  SET_PAST_PROPOSALS,
  GET_CURRENT_ROUND_PROPOSALS,
} from 'pages/Governance/Governance.actions'
import { GovernanceStorage, CurrentRoundProposalsStorageType } from '../utils/TypesAndInterfaces/Governance'
import { GET_GOVERNANCE_SATELLITE_STORAGE } from 'pages/SatelliteGovernance/SatelliteGovernance.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import type {
  GovernanceSatelliteActionGraphQL,
  GovernanceSatelliteGraphQL,
} from '../utils/TypesAndInterfaces/Governance'
import { normalizeGovernanceStorage } from '../pages/Governance/Governance.helpers'

const PROPOSAL = 'PROPOSAL',
  VOTING = 'VOTING',
  TIME_LOCK = 'TIME_LOCK'

export type GovernanceSatellite = {
  governance_satellite: GovernanceSatelliteGraphQL[]
  governance_satellite_action: GovernanceSatelliteActionGraphQL[]
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
    governance_satellite_action: [],
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
    default:
      return state
  }
}
