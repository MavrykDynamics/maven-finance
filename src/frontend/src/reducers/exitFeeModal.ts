import { HIDE_EXIT_FEE_MODAL, SET_EXIT_FEE_AMOUNT, SHOW_EXIT_FEE_MODAL } from 'pages/Doorman/ExitFeeModal/ExitFeeModal.actions'

export interface ExitFeeModalState {
  showing: boolean
  amount: number
}

const exitFeeModalDefaultState: ExitFeeModalState = {
  showing: false,
  amount: 0
}

export function exitFeeModal(state = exitFeeModalDefaultState, action: any): ExitFeeModalState {
  switch (action.type) {
    case SET_EXIT_FEE_AMOUNT: {
      return {
        ...state,
        amount: action.amount,
      }
    }
    case SHOW_EXIT_FEE_MODAL: {
      return {
        showing: true,
        amount: action.amount,
      }
    }
    case HIDE_EXIT_FEE_MODAL: {
       return {
         ...state,
         showing: false,
       }
    }
    default:
      return state
  }
}
