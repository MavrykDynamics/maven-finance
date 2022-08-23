import { GET_COUNCIL_STORAGE } from '../pages/Council/Council.actions'
import { CouncilStorage } from '../utils/TypesAndInterfaces/Council'

import { GET_COUNCIL_PAST_ACTIONS_STORAGE, GET_COUNCIL_PENDING_ACTIONS_STORAGE } from '../pages/Council/Council.actions'

export interface CouncilPastAction {
  council_id: string
  executed: boolean
  executed_datetime: string
  executed_level: number
  expiration_datetime: string
  id: number
  initiator_id: string
  signers_count: number
  start_datetime: string
  status: number
  action_type: string
  council_action_record_parameters: Record<string, string>[]
}

export interface CouncilState {
  councilStorage: CouncilStorage | any
  councilPendingActions: CouncilPastAction[]
  councilPastActions: CouncilPastAction[]
}

const defaultCouncilStorage: CouncilStorage = {
  address: '',
  config: {
    threshold: 0,
    actionExpiryDays: 0,
  },
  councilActionsLedger: [],
  councilMembers: [],
  actionCounter: 0,
}
const councilDefaultState: CouncilState = {
  councilStorage: defaultCouncilStorage,
  councilPendingActions: [],
  councilPastActions: [],
}

export function council(state = councilDefaultState, action: any): CouncilState {
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
