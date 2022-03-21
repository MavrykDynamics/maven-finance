import { GET_COUNCIL_STORAGE } from '../pages/Treasury/Treasury.actions'
import { CouncilStorage } from '../utils/TypesAndInterfaces/Council'

export interface CouncilState {
  councilStorage: CouncilStorage | any
}

const councilDefaultState: CouncilState = {
  councilStorage: {},
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
