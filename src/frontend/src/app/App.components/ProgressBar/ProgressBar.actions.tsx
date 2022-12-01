import { AppDispatch, GetState } from 'app/App.controller'

import { ProgressBarStatus } from './ProgressBar.constants'

export const SET_PROGRESS_BAR_STATUS = 'SET_PROGRESS_BAR_STATUS'
export const setProgressBarStatus = (status: ProgressBarStatus) => (dispatch: AppDispatch) => {
  dispatch({
    type: SET_PROGRESS_BAR_STATUS,
    status,
  })
}

export const updateProgressBar = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    loading: { isLoading },
  } = getState()

  if (isLoading) {
    await dispatch(setProgressBarStatus(ProgressBarStatus.MOVING))
  } else {
    await dispatch(setProgressBarStatus(ProgressBarStatus.NO_DISPLAY))
  }
}
