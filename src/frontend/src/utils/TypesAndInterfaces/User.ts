import type { Mavryk_User } from '../generated/graphqlTypes'

export interface UserData {
  myAddress: string
  myMvkTokenBalance: number
  mySMvkTokenBalance: number
  participationFeesPerShare: number
  satelliteMvkIsDelegatedTo: string
  isSatellite: boolean
  // myDoormanRewardsData: UserDoormanRewardsData
  // myFarmRewardsData: UserFarmRewardsData[]
  mySatelliteRewardsData?: UserSatelliteRewardsData
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
