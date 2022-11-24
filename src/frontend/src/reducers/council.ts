import { GET_COUNCIL_STORAGE } from '../pages/Council/Council.actions'
import { CouncilStorage, CouncilActions } from '../utils/TypesAndInterfaces/Council'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { GET_COUNCIL_PAST_ACTIONS_STORAGE, GET_COUNCIL_PENDING_ACTIONS_STORAGE } from '../pages/Council/Council.actions'

export interface CouncilPastAction {
  council_id: string
  executed: boolean
  execution_datetime: string
  execution_level: number
  expiration_datetime: string
  id: number
  initiator_id: string
  signers_count: number
  start_datetime: string
  status: number
  action_type: string
  parameters: Record<string, string>[]
}

export interface CouncilState {
  councilStorage: CouncilStorage
  councilPendingActions: CouncilActions
  councilPastActions: CouncilPastAction[]
}

const defaultCouncilStorage: CouncilStorage = {
  address: '',
  config: {
    threshold: 0,
    actionExpiryDays: 0,
  },
  councilMemberImageMaxLength: 0,
  councilMemberNameMaxLength: 0,
  councilMemberWebsiteMaxLength: 0,
  requestPurposeMaxLength: 0,
  requestTokenNameMaxLength: 0,
  councilActionsLedger: [],
  councilMembers: [],
  actionCounter: 0,
}
const councilDefaultState: CouncilState = {
  councilStorage: defaultCouncilStorage,
  councilPendingActions: [],
  councilPastActions: [],
}

export function council(state = councilDefaultState, action: Action) {
  switch (action.type) {
    case GET_COUNCIL_STORAGE:
      return {
        ...state,
        councilStorage: action.councilStorage,
      }
    case GET_COUNCIL_PAST_ACTIONS_STORAGE:
      return {
        ...state,
        councilPastActions: action.councilPastActions,
      }
    case GET_COUNCIL_PENDING_ACTIONS_STORAGE:
      return {
        ...state,
        councilPendingActions: action.councilPendingActions,
      }
    default:
      return state
  }
}
