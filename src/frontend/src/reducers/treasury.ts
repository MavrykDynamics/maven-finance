import { SET_TREASURY_STORAGE } from '../pages/Treasury/Treasury.actions'
import { TreasuryStorage } from '../utils/TypesAndInterfaces/Treasury'

export interface TreasuryState {
  treasuryStorage: TreasuryStorage | any
}

export interface TreasuryAddressesType {
  treasuryAddresses: Array<string>
}

const treasuryDefaultState: TreasuryState = {
  treasuryStorage: {},
}

export function treasury(state = treasuryDefaultState, action: any): TreasuryState {
  switch (action.type) {
    case SET_TREASURY_STORAGE : 
      return {
        ...state,
        treasuryStorage: action.theasuryData
      }
    default:
      return state
  }
}
