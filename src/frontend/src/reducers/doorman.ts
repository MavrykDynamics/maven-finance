import {
  COMPOUND_ERROR,
  COMPOUND_REQUEST,
  COMPOUND_RESULT,
  GET_DOORMAN_STORAGE,
  STAKE_ERROR,
  STAKE_REQUEST,
  STAKE_RESULT,
  UNSTAKE_ERROR,
  UNSTAKE_REQUEST,
  UNSTAKE_RESULT,
  GET_STAKE_HISTORY_DATA,
  GET_SMVK_HISTORY_DATA,
} from 'pages/Doorman/Doorman.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { DoormanStorage, StakeHistoryData, SmvkHistoryData } from '../utils/TypesAndInterfaces/Doorman'

export const STAKE = 'STAKE'
export const UNSTAKE = 'UNSTAKE'
export const COMPOUND = 'COMPOUND'

export interface DoormanState {
  type?: typeof STAKE | typeof UNSTAKE | typeof GET_DOORMAN_STORAGE | typeof COMPOUND
  amount: number
  error?: object
  doormanStorage?: DoormanStorage
  totalStakedMvk?: number
  stakeHistoryData: StakeHistoryData
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
  stakeHistoryData: [],
  smvkHistoryData: [],
}

export function doorman(state = doormanDefaultState, action: Action) {
  switch (action.type) {
    case STAKE_REQUEST:
      return {
        ...state,
        type: STAKE,
        amount: action.amount,
        error: undefined,
      }
    case STAKE_RESULT:
      return {
        ...state,
        type: STAKE,
        amount: state.amount,
        error: undefined,
      }
    case STAKE_ERROR:
      return {
        ...state,
        type: STAKE,
        amount: 0,
        error: action.error,
      }
    case UNSTAKE_REQUEST:
      return {
        ...state,
        type: UNSTAKE,
        amount: action.amount,
        error: undefined,
      }
    case UNSTAKE_RESULT:
      return {
        ...state,
        type: UNSTAKE,
        amount: state.amount,
        error: undefined,
      }
    case UNSTAKE_ERROR:
      return {
        ...state,
        type: UNSTAKE,
        amount: 0,
        error: action.error,
      }
    case COMPOUND_REQUEST:
      return {
        ...state,
        type: COMPOUND,
        error: undefined,
      }
    case COMPOUND_RESULT:
      return {
        ...state,
        type: UNSTAKE,
        error: undefined,
      }
    case COMPOUND_ERROR:
      return {
        ...state,
        type: COMPOUND,
        error: action.error,
      }
    case GET_DOORMAN_STORAGE:
      return {
        ...state,
        type: GET_DOORMAN_STORAGE,
        doormanStorage: action.storage,
        totalStakedMvk: action.totalStakedMvkSupply,
        amount: 0,
      }
    case GET_STAKE_HISTORY_DATA:
      return {
        ...state,
        type: GET_STAKE_HISTORY_DATA,
        stakeHistoryData: action.stakeHistoryData,
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
