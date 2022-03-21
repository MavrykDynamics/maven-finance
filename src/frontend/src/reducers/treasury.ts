import { GET_TREASURY_STORAGE } from '../pages/Treasury/Treasury.actions'
import { TreasuryStorage } from '../utils/TypesAndInterfaces/Treasury'

export interface TreasuryState {
  treasuryStorage: TreasuryStorage | any
}

const treasuryDefaultState: TreasuryState = {
  treasuryStorage: {},
}

export function treasury(state = treasuryDefaultState, action: any): TreasuryState {
  switch (action.type) {
    case GET_TREASURY_STORAGE:
      return {
        treasuryStorage: action.treasuryStorage,
      }
    default:
      return state
  }
}
