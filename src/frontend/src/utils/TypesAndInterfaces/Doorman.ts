import { MichelsonMap } from '@taquito/taquito'

export interface UserStakeRecord {
  balance: number
  participationFeesPerShare: number
}
export type UserStakeBalanceLedger = Map<string, string>

export type UserStakeRecordsLedger = Map<string, Map<number, UserStakeRecord>>
export interface DoormanBreakGlassConfigType {
  stakeIsPaused: boolean
  unstakeIsPaused: boolean
  compoundIsPaused: boolean
}
export interface DoormanStorage {
  admin?: string
  minMvkAmount?: number

  whitelistContracts?: MichelsonMap<string, unknown>
  generalContracts?: MichelsonMap<string, unknown>

  breakGlassConfig?: DoormanBreakGlassConfigType
  userStakeBalanceLedger?: UserStakeBalanceLedger

  tempMvkTotalSupply?: number
  tempMvkMaximumTotalSupply?: number
  stakedMvkTotalSupply?: number
  unclaimedRewards?: number

  logExitFee?: number // to be removed after testing
  logFinalAmount?: number // to be removed after testing

  accumulatedFeesPerShare?: number
}
