import { GET_DOORMAN_STORAGE, GET_SMVK_HISTORY_DATA, GET_MVK_MINT_HISTORY_DATA } from 'pages/Doorman/Doorman.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { DoormanStorage, MvkMintHistoryData, SmvkHistoryData } from '../utils/TypesAndInterfaces/Doorman'

export const STAKE = 'STAKE'
export const UNSTAKE = 'UNSTAKE'
export const COMPOUND = 'COMPOUND'

export interface DoormanState {
  type?: typeof STAKE | typeof UNSTAKE | typeof GET_DOORMAN_STORAGE | typeof COMPOUND
  amount: number
  error?: object
  doormanStorage?: DoormanStorage
  totalStakedMvk?: number
  mvkMintHistoryData: MvkMintHistoryData
  smvkHistoryData: SmvkHistoryData
}

const defaultStorageState: DoormanStorage = {
  minMvkAmount: 0,
  unclaimedRewards: 0,
  breakGlassConfig: {
    stakeIsPaused: false,
    unstakeIsPaused: false,
    compoundIsPaused: false,
    farmClaimIsPaused: false,
  },
  totalStakedMvk: 0,
  accumulatedFeesPerShare: 0,
}

const doormanDefaultState: DoormanState = {
  type: undefined,
  amount: 0,
  error: undefined,
  doormanStorage: defaultStorageState,
  totalStakedMvk: 0,
  mvkMintHistoryData: [],
  smvkHistoryData: [],
}

export function doorman(state = doormanDefaultState, action: Action) {
  switch (action.type) {
    case GET_DOORMAN_STORAGE:
      return {
        ...state,
        type: GET_DOORMAN_STORAGE,
        doormanStorage: action.storage,
        totalStakedMvk: action.totalStakedMvkSupply,
        amount: 0,
      }
    case GET_MVK_MINT_HISTORY_DATA:
      return {
        ...state,
        type: GET_MVK_MINT_HISTORY_DATA,
        mvkMintHistoryData: action.mvkMintHistoryData,
      }
    case GET_SMVK_HISTORY_DATA:
      return {
        ...state,
        type: GET_SMVK_HISTORY_DATA,
        smvkHistoryData: action.smvkHistoryData,
      }
    default:
      return state
  }
}
