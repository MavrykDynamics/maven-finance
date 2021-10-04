import { State } from 'reducers'

import { ProgressBarStatus } from './ProgressBar.constants'

export const SET_PROGRESS_BAR_STATUS = 'SET_PROGRESS_BAR_STATUS'

export const setProgressBarStatus = (status: ProgressBarStatus) => (dispatch: any) => {
  dispatch({
    type: SET_PROGRESS_BAR_STATUS,
    status,
  })
}

export const hideProgressBar = () => (dispatch: any, getState: any) => {
  const state: State = getState()

  if (state.progressBar.status === ProgressBarStatus.READY || state.progressBar.status === ProgressBarStatus.MOVING) {
    dispatch(setProgressBarStatus(ProgressBarStatus.NO_DISPLAY))
  }
}

export const updateProgressBar = () => (dispatch: any, getState: any) => {
  const state: State = getState()

  if (
    state.loading &&
    (state.progressBar.status === ProgressBarStatus.DONE || state.progressBar.status === ProgressBarStatus.NO_DISPLAY)
  ) {
    dispatch(setProgressBarStatus(ProgressBarStatus.READY))
    dispatch(setProgressBarStatus(ProgressBarStatus.MOVING))
  } else if (
    !state.loading &&
    (state.progressBar.status === ProgressBarStatus.READY || state.progressBar.status === ProgressBarStatus.MOVING)
  ) {
    dispatch(setProgressBarStatus(ProgressBarStatus.DONE))
    setTimeout(() => {
      dispatch(setProgressBarStatus(ProgressBarStatus.NO_DISPLAY))
    }, 500)
  }
}
