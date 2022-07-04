import { TreasuryType } from 'utils/TypesAndInterfaces/Treasury';
import { SET_TREASURY_STORAGE } from '../pages/Treasury/Treasury.actions'

export interface TreasuryState {
  treasuryStorage: Array<TreasuryType>
  treasuryFactoryAddress: string
}

const treasuryDefaultState: TreasuryState = {
  treasuryStorage: [],
  treasuryFactoryAddress: ''
}

export function treasury(state = treasuryDefaultState, action: any): TreasuryState {
  switch (action.type) {
    case SET_TREASURY_STORAGE : 
      return {
        ...state,
        treasuryStorage: action.treasuryStorage,
        treasuryFactoryAddress: action.treasuryFactoryAddress
      }
    default:
      return state
  }
}
