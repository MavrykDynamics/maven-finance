import { MichelsonMap } from '@taquito/taquito'
import { GET_FARM_STORAGE } from '../pages/Farms/Farms.actions'

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

export interface FarmState {
  farmStorage: FarmStorage | any
}

const farmDefaultState: FarmState = {
  farmStorage: {},
}

export function farm(state = farmDefaultState, action: any): FarmState {
  switch (action.type) {
    case GET_FARM_STORAGE:
      return {
        ...state,
        farmStorage: action.farmStorage,
      }
    default:
      return state
  }
}
