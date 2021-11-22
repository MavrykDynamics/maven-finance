import { STAKE_REQUEST, STAKE_RESULT, STAKE_ERROR, UNSTAKE_REQUEST, UNSTAKE_RESULT, UNSTAKE_ERROR } from "pages/Doorman/Doorman.actions"

const STAKE = 'STAKE'
const UNSTAKE = 'UNSTAKE'

export interface DoormanState {
  type?: typeof STAKE | typeof UNSTAKE
  amount: number
  error?: any
}

const doormanDefaultState: DoormanState = {
  type: undefined,
  amount: 0,
  error: undefined,
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
        amount: 0,
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
        amount: 0,
        error: undefined,
      }
    case UNSTAKE_ERROR:
      return {
        type: UNSTAKE,
        amount: 0,
        error: action.error,
      }
    default:
      return state
  }
}
