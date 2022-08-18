import type { Doorman } from '../generated/graphqlTypes'

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
  farmClaimIsPaused: boolean
}

export interface DoormanStorage {
  admin?: string
  minMvkAmount?: number

  breakGlassConfig?: DoormanBreakGlassConfigType
  userStakeBalanceLedger?: UserStakeBalanceLedger

  totalStakedMvk?: number
  unclaimedRewards?: number
  accumulatedFeesPerShare?: number
}

export type DoormanGraphQl = Omit<Doorman, '__typename'>
