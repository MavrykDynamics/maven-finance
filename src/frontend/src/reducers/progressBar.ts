import { SET_PROGRESS_BAR_STATUS } from 'app/App.components/ProgressBar/ProgressBar.actions'
import { ProgressBarStatus } from 'app/App.components/ProgressBar/ProgressBar.constants'

export interface ProgressBarState {
  status: ProgressBarStatus
}

const progressBarDefaultState: ProgressBarState = {
  status: ProgressBarStatus.NO_DISPLAY,
}

export function progressBar(state = progressBarDefaultState, action: any): ProgressBarState {
  switch (action.type) {
    case SET_PROGRESS_BAR_STATUS:
      return {
        status: action.status,
      }
    default:
      return state
  }
}
