export interface UserDoormanRewardsData {
  generalUnclaimedRewards: number
  generalAccumulatedFeesPerShare: number
  myParticipationFeesPerShare: number
  myAvailableDoormanRewards: number
}

export interface UserFarmRewardsData {
  farmId: string
  generalAccumulatedFeesPerShare: number
  blocksPerMinute: number
  currentRewardPerBlock: number
  lastBlockUpdate: number
  generalTotalRewards: number
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

export interface UserData {
  myAddress: string
  myMvkTokenBalance: number
  mySMvkTokenBalance: number
  satelliteMvkIsDelegatedTo: string
  myDelegationHistory?: any[]
  myDoormanRewardsData: UserDoormanRewardsData
  myFarmRewardsData: UserFarmRewardsData[]
  mySatelliteRewardsData: UserSatelliteRewardsData
}
