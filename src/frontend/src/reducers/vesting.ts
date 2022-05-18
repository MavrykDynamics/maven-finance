import { MichelsonMap } from '@taquito/taquito'
import { GET_TREASURY_STORAGE } from '../pages/Treasury/Treasury.actions'

type VestingConfig = {
  defaultCliffPeriod: number
  defaultCooldownPeriod: number
  newBlockTimeLevel: number
  newBlocksPerMinute: number
  blocksPerMinute: number
  blocksPerMonth: number
}
export interface VestingStorage {
  admin: string
  config: VestingConfig
  whitelistContracts: MichelsonMap<string, unknown>
  generalContracts: MichelsonMap<string, unknown>
  claimLedger: MichelsonMap<string, unknown>
  vesteeLedger: MichelsonMap<string, unknown>
  totalVestedAmount: number
  tempBlockLevel: number
}
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
