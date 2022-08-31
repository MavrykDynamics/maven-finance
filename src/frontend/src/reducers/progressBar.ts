import { SET_PROGRESS_BAR_STATUS } from 'app/App.components/ProgressBar/ProgressBar.actions'
import { ProgressBarStatus } from 'app/App.components/ProgressBar/ProgressBar.constants'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface ProgressBarState {
  status: ProgressBarStatus
}

const progressBarDefaultState: ProgressBarState = {
  status: ProgressBarStatus.NO_DISPLAY,
}

export function progressBar(state = progressBarDefaultState, action: Action) {
  switch (action.type) {
    case SET_PROGRESS_BAR_STATUS:
      return {
        status: action.status,
      }
    default:
      return state
  }
}
