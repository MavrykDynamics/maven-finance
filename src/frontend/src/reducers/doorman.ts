import {
  STAKE_ERROR,
  STAKE_REQUEST,
  STAKE_RESULT,
  UNSTAKE_ERROR,
  UNSTAKE_REQUEST,
  UNSTAKE_RESULT,
} from 'pages/Doorman/Doorman.actions'

const STAKE = 'STAKE'
const UNSTAKE = 'UNSTAKE'
const GET_DOORMAN_STORAGE = 'GET_DOORMAN_STORAGE'

export interface UserStakeRecord {
  time: string
  amount: number
  exitFee: number
  mvkLoyaltyIndex: number
  mvkTotalSupply: number
  opType: typeof STAKE | typeof UNSTAKE
}
export type UserStakeBalanceLedger = Map<string, string>

export type UserStakeRecordsLedger = Map<string, Map<number, UserStakeRecord>>
export interface DoormanBreakGlassConfigType {
  stakeIsPaused: boolean
  unstakeIsPaused: boolean
}
export interface DoormanStorage {
  userStakeBalanceLedger: UserStakeBalanceLedger
  userStakeRecordsLedger: UserStakeRecordsLedger
  totalStakedMvkSupply: number
  admin: string
  breakGlassConfig: DoormanBreakGlassConfigType
  mvkTokenAddress: string
  delegationAddress : string
  exitFeePoolAddress: string
  tempMvkTotalSupply: number
  logExitFee?: number // to be removed after testing
  logFinalAmount?: number // to be removed after testing
}
export interface DoormanState {
  type?: typeof STAKE | typeof UNSTAKE | typeof GET_DOORMAN_STORAGE
  amount: number
  error?: any
  doormanStorage?: DoormanStorage | undefined
  totalStakedMvkSupply?: number
}

const doormanDefaultState: DoormanState = {
  type: undefined,
  amount: 0,
  error: undefined,
  doormanStorage: {
    userStakeBalanceLedger: new Map<string, string>(),
    userStakeRecordsLedger: new Map<string, Map<number, UserStakeRecord>>(),
    totalStakedMvkSupply: 0,
    admin: '',
    breakGlassConfig: {
      stakeIsPaused: false,
      unstakeIsPaused: false,
    },
    mvkTokenAddress: '',
    delegationAddress : '',
    exitFeePoolAddress: '',
    tempMvkTotalSupply: 0,
    logExitFee: 0, // to be removed after testing
    logFinalAmount: 0, // to be removed after testing
  },
  totalStakedMvkSupply: 0,
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
        type: GET_DOORMAN_STORAGE,
        doormanStorage: action.storage,
        totalStakedMvkSupply: action.totalStakedMvkSupply,
        amount: 0,
        error: undefined,
      }
    default:
      return state
  }
}
