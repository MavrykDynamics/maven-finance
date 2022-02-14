import { MichelsonMap } from '@taquito/taquito'
import { GET_TREASURY_STORAGE } from '../pages/Treasury/Treasury.actions'

export interface TreasuryStorage {
  admin: string
  config: {
    minXtzAmount: number
    maxXtzAmount: number
  }
  whitelistContracts: MichelsonMap<string, unknown>
  whitelistTokenContracts: MichelsonMap<string, unknown>
  generalContracts: MichelsonMap<string, unknown>
  breakGlassConfig: {
    transferIsPaused: boolean
    mintAndTransferIsPaused: boolean
    updateOperatorsIsPaused: boolean
  }
}
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
