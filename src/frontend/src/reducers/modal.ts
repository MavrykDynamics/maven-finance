import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { SHOW_MODAL, HIDE_MODAL } from 'app/App.components/Modal/Modal.actions'
import { ModalKind } from '../app/App.components/Modal/Modal.constants'

export interface ModalState {
  kind?: ModalKind
  showing: boolean
}

const modalDefaultState: ModalState = {
  showing: false,
}

export function modal(state = modalDefaultState, action: Action) {
  switch (action.type) {
    case SHOW_MODAL: {
      return {
        kind: action.kind,
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
