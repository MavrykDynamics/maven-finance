import type { Mavryk_User } from '../generated/graphqlTypes'

export interface UserData {
  myAddress: string
  myMvkTokenBalance: number
  mySMvkTokenBalance: number
  participationFeesPerShare: number
  satelliteMvkIsDelegatedTo: string
  isSatellite: boolean
  myDoormanRewardsData: UserDoormanRewardsData
  myFarmRewardsData: Record<string, UserFarmRewardsData>
  mySatelliteRewardsData: UserSatelliteRewardsData
}

export interface UserDoormanRewardsData {
  generalUnclaimedRewards: number
  generalAccumulatedFeesPerShare: number
  myParticipationFeesPerShare: number
  myAvailableDoormanRewards: number
}

export interface UserFarmRewardsData {
  generalAccumulatedRewardsPerShare: number
  currentRewardPerBlock: number
  lastBlockUpdate: number
  generalTotalRewards: number
  generalPaidReward: number
  generalUnpaidReward: number
  infinite: boolean
  totalLPTokenDeposited: number
  myDepositedAmount: number
  myParticipationRewardsPerShare: number
  myAvailableFarmRewards: number
}

export interface UserSatelliteRewardsData {
  unpaid: number
  paid: number
  participationRewardsPerShare: number
  satelliteAccumulatedRewardPerShare: number
  myAvailableSatelliteRewards: number
}

export type UserType = {
  id: string
  name: string
  descr: string
  website: string
  valueLocked: string
  creationDate: number | string
  feeds: string[]
}

export type MavrykUserGraphQl = Omit<Mavryk_User, '__typename'>
