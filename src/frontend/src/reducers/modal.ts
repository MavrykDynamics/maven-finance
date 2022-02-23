import { SHOW_MODAL, HIDE_MODAL } from 'app/App.components/Modal/Modal.actions'

export interface ModalState {
  showing: boolean
}

const modalDefaultState: ModalState = {
  showing: false,
}

export function modal(state = modalDefaultState, action: any): ModalState {
  switch (action.type) {
    case SHOW_MODAL: {
      return {
        showing: true,
      }
    }
    case HIDE_MODAL: {
      return modalDefaultState
    }
    default:
      return state
  }
}
