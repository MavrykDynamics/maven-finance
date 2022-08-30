import { TreasuryType } from 'utils/TypesAndInterfaces/Treasury'
import { SET_TREASURY_STORAGE } from '../pages/Treasury/Treasury.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface TreasuryState {
  treasuryStorage: Array<TreasuryType>
  treasuryFactoryAddress: string
}

const treasuryDefaultState: TreasuryState = {
  treasuryStorage: [],
  treasuryFactoryAddress: '',
}

export function treasury(state = treasuryDefaultState, action: Action) {
  switch (action.type) {
    case SET_TREASURY_STORAGE:
      return {
        ...state,
        treasuryStorage: action.treasuryStorage,
        treasuryFactoryAddress: action.treasuryFactoryAddress,
      }
    default:
      return state
  }
}
