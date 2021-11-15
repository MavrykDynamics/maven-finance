import { STAKE, UN_STAKE } from 'pages/Doorman/Doorman.actions'

export interface DoormanState {
  amount: number
}

const doormanDefaultState: DoormanState = {
  amount: 0,
}

export function doorman(state = doormanDefaultState, action: any): DoormanState {
  switch (action.type) {
    case STAKE:
      return {
        amount: action.amount,
      }
    case UN_STAKE:
      return {
        amount: action.amount,
      }
    default:
      return state
  }
}
