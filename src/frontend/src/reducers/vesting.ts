import { GET_TREASURY_STORAGE } from '../pages/Treasury/Treasury.actions'
import { VestingStorage } from '../utils/TypesAndInterfaces/Vesting'

export interface VestingState {
  vestingStorage: VestingStorage | any
}

const VestingDefaultState: VestingState = {
  vestingStorage: {},
}

export function vesting(state = VestingDefaultState, action: any): VestingState {
  switch (action.type) {
    case GET_TREASURY_STORAGE:
      return {
        vestingStorage: action.vestingStorage,
      }
    default:
      return state
  }
}
