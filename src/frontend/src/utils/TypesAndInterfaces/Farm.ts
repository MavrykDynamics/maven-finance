export interface FarmStorage {
  accumulatedMvkPerShare: number
  address: string
  lpTokenAddress: string
  name: string
  blocksPerMinute: number
  lpTokenBalance: number
  currentRewardPerBlock: number
  claimPaused: boolean
  depositPaused: boolean
  farmFactoryId: null
  infinite: boolean
  initBlock: number
  lastBlockUpdate: number
  lpBalance: number
  lpToken: string
  open: boolean
  rewardPerBlock: number
  rewardsFromTreasury: boolean
  totalBlocks: number
  withdrawPaused: boolean
}
