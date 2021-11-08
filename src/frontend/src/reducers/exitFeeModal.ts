import { SHOW_EXIT_FEE_MODAL, HIDE_EXIT_FEE_MODAL, STAKE } from "pages/Stake/ExitFeeModal/ExitFeeModal.actions"

export interface ExitFeeModalState {
  showing: boolean
}

const exitFeeModalDefaultState: ExitFeeModalState = {
  showing: false,
}

export function exitFeeModal(state = exitFeeModalDefaultState, action: any): ExitFeeModalState {
  switch (action.type) {
    case SHOW_EXIT_FEE_MODAL: {
      return {
        showing: true,
      }
    }
    case HIDE_EXIT_FEE_MODAL: {
      return exitFeeModalDefaultState
    }
    case STAKE: {
      return exitFeeModalDefaultState
    }
    default:
      return state
  }
}
