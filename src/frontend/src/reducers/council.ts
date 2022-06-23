import { GET_COUNCIL_STORAGE } from '../pages/Treasury/Treasury.actions'
import { CouncilStorage } from '../utils/TypesAndInterfaces/Council'
import { getItemFromStorage } from '../utils/storage'
import {GET_COUNCIL_PAST_ACTIONS_STORAGE} from '../pages/Council/Council.actions'

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
}


export interface CouncilState {
  councilStorage: CouncilStorage | any
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
  councilStorage: getItemFromStorage('CouncilStorage') || defaultCouncilStorage,
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
    default:
      return state
  }
}
