import { SHOW_EXIT_FEE_MODAL, HIDE_EXIT_FEE_MODAL } from "pages/Doorman/ExitFeeModal/ExitFeeModal.actions"

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
    default:
      return state
  }
}
