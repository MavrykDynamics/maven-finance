import { MichelsonMap } from '@taquito/taquito'

export interface FarmStorage {
  admin: string
  generalContracts: MichelsonMap<string, unknown>
  whitelistContracts: MichelsonMap<string, unknown>
  breakGlassConfig: {
    depositIsPaused: boolean
    withdrawIsPaused: boolean
    claimIsPaused: boolean
  }
  lastBlockUpdate: number
  accumulatedMVKPerShare: number
  claimedRewards: {
    unpaid: number
    paid: number
  }
  plannedRewards: {
    totalBlocks: number
    rewardPerBlock: number
  }
  delegators: MichelsonMap<string, unknown>
  lpToken: {
    tokenAddress: string
    tokenId: number
    tokenStandard: any
    tokenBalance: number
  }
  open: boolean
  initBlock: number
}
