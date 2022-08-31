import { AppDispatch, GetState } from 'app/App.controller'

import { ProgressBarStatus } from './ProgressBar.constants'

export const SET_PROGRESS_BAR_STATUS = 'SET_PROGRESS_BAR_STATUS'

export const setProgressBarStatus = (status: ProgressBarStatus) => (dispatch: AppDispatch) => {
  dispatch({
    type: SET_PROGRESS_BAR_STATUS,
    status,
  })
}

export const hideProgressBar = () => (dispatch: AppDispatch, getState: GetState) => {
  const state = getState()

  if (state.progressBar.status === ProgressBarStatus.READY || state.progressBar.status === ProgressBarStatus.MOVING) {
    dispatch(setProgressBarStatus(ProgressBarStatus.NO_DISPLAY))
  }
}

export const updateProgressBar = () => (dispatch: AppDispatch, getState: GetState) => {
  const state = getState()

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
