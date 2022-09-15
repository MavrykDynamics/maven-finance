import { GET_VESTING_STORAGE } from './../pages/Treasury/Treasury.actions';
import { VestingStorage } from '../utils/TypesAndInterfaces/Vesting'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

import { normalizeVestingStorage } from '../app/App.helpers'

export interface VestingState {
  vestingStorage: VestingStorage
}

const VestingDefaultState: VestingState = {
  vestingStorage: normalizeVestingStorage(null),
}

export function vesting(state = VestingDefaultState, action: Action) {
  switch (action.type) {
    case GET_VESTING_STORAGE:
      return {
        vestingStorage: action.vestingStorage,
      }
    default:
      return state
  }
}
