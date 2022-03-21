import {
  GET_DOORMAN_STORAGE,
  STAKE_ERROR,
  STAKE_REQUEST,
  STAKE_RESULT,
  UNSTAKE_ERROR,
  UNSTAKE_REQUEST,
  UNSTAKE_RESULT,
} from 'pages/Doorman/Doorman.actions'
import { MichelsonMap } from '@taquito/taquito'
import { getItemFromStorage } from '../utils/storage'
import { DoormanStorage } from '../utils/TypesAndInterfaces/Doorman'

export const STAKE = 'STAKE'
export const UNSTAKE = 'UNSTAKE'

export interface DoormanState {
  type?: typeof STAKE | typeof UNSTAKE | typeof GET_DOORMAN_STORAGE
  amount: number
  error?: any
  doormanStorage?: DoormanStorage
  totalStakedMvkSupply?: number
  isOperator: boolean
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
  doormanStorage: getItemFromStorage('DoormanStorage') ?? defaultStorageState,
  totalStakedMvkSupply: 0,
  isOperator: false,
}

export function doorman(state = doormanDefaultState, action: any): DoormanState {
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
    case GET_DOORMAN_STORAGE:
      return {
        ...state,
        type: GET_DOORMAN_STORAGE,
        doormanStorage: action.storage,
        totalStakedMvkSupply: action.totalStakedMvkSupply,
        amount: 0,
      }
    default:
      return state
  }
}
