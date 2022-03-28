import { GET_COUNCIL_STORAGE } from '../pages/Treasury/Treasury.actions'
import { CouncilStorage } from '../utils/TypesAndInterfaces/Council'
import { getItemFromStorage } from '../utils/storage'

export interface CouncilState {
  councilStorage: CouncilStorage | any
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
}

export function council(state = councilDefaultState, action: any): CouncilState {
  switch (action.type) {
    case GET_COUNCIL_STORAGE:
      return {
        councilStorage: action.councilStorage,
      }
    default:
      return state
  }
}
