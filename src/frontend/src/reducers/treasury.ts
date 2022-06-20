import { TreasuryType } from 'utils/TypesAndInterfaces/Treasury';
import { SET_TREASURY_STORAGE } from '../pages/Treasury/Treasury.actions'

export interface TreasuryState {
  treasuryStorage: Array<TreasuryType>
}

const treasuryDefaultState: TreasuryState = {
  treasuryStorage: [],
}

export function treasury(state = treasuryDefaultState, action: any): TreasuryState {
  switch (action.type) {
    case SET_TREASURY_STORAGE : 
      return {
        ...state,
        treasuryStorage: action.treasuryStorage
      }
    default:
      return state
  }
}
