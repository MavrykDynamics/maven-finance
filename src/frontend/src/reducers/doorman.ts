import {
  GET_DOORMAN_STORAGE,
  SET_USER_STAKE_INFO,
  STAKE_ERROR,
  STAKE_REQUEST,
  STAKE_RESULT,
  UNSTAKE_ERROR,
  UNSTAKE_REQUEST,
  UNSTAKE_RESULT,
} from 'pages/Doorman/Doorman.actions'
import { MichelsonMap } from '@taquito/taquito'
import { getItemFromStorage, updateItemInStorage } from '../utils/storage'

const STAKE = 'STAKE'
const UNSTAKE = 'UNSTAKE'

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
export interface DoormanState {
  type?: typeof STAKE | typeof UNSTAKE | typeof GET_DOORMAN_STORAGE | typeof SET_USER_STAKE_INFO
  amount: number
  error?: any
  doormanStorage?: DoormanStorage
  totalStakedMvkSupply?: number
  userStakeInfo?: any
}
const defaultStorageState = {
  admin: '',
  minMvkAmount: 0,

  whitelistContracts: new MichelsonMap<string, unknown>(),
  generalContracts: new MichelsonMap<string, unknown>(),

  breakGlassConfig: {
    stakeIsPaused: false,
    unstakeIsPaused: false,
    compoundIsPaused: false,
  },
  userStakeBalanceLedger: new Map<string, string>(),
  tempMvkTotalSupply: 0,
  tempMvkMaximumTotalSupply: 0,
  stakedMvkTotalSupply: 0,

  logExitFee: 0, // to be removed after testing
  logFinalAmount: 0, // to be removed after testing

  accumulatedFeesPerShare: 0,
}
const doormanDefaultState: DoormanState = {
  type: undefined,
  amount: 0,
  error: undefined,
  doormanStorage: getItemFromStorage('DoormanStorage') || defaultStorageState,
  totalStakedMvkSupply: 0,
  userStakeInfo: getItemFromStorage('UserInfo')?.stakeInfo || {},
}

export function doorman(state = doormanDefaultState, action: any): DoormanState {
  switch (action.type) {
    case STAKE_REQUEST:
      return {
        type: STAKE,
        amount: action.amount,
        error: undefined,
      }
    case STAKE_RESULT:
      return {
        type: STAKE,
        amount: state.amount,
        error: undefined,
      }
    case STAKE_ERROR:
      return {
        type: STAKE,
        amount: 0,
        error: action.error,
      }
    case UNSTAKE_REQUEST:
      return {
        type: UNSTAKE,
        amount: action.amount,
        error: undefined,
      }
    case UNSTAKE_RESULT:
      return {
        type: UNSTAKE,
        amount: state.amount,
        error: undefined,
      }
    case UNSTAKE_ERROR:
      return {
        type: UNSTAKE,
        amount: 0,
        error: action.error,
      }
    case GET_DOORMAN_STORAGE:
      return {
        ...state,
        type: GET_DOORMAN_STORAGE,
        doormanStorage: action.storage,
        totalStakedMvkSupply: action.totalStakedMvkSupply,
        amount: 0,
      }
    case SET_USER_STAKE_INFO:
      return {
        ...state,
        type: SET_USER_STAKE_INFO,
        userStakeInfo: action.userStakeInfo,
      }
    default:
      return state
  }
}
