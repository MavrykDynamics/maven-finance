import { State } from 'reducers'
import type { AppDispatch, RootState } from '../../App.controller'
export const SHOW_TOASTER = 'SHOW_TOASTER'
export const HIDE_TOASTER = 'HIDE_TOASTER'

export const showToaster =
  (status: string, title: string, message: string, timeout: number = 4000) =>
  (dispatch: AppDispatch, getState: RootState) => {
    const state: State = getState()
    if (!state.toaster.showing) {
      dispatch({
        type: SHOW_TOASTER,
        status,
        title,
        message,
      })
      setTimeout(() => {
        dispatch(hideToaster())
      }, timeout)
    }
  }

export const hideToaster = () => (dispatch: AppDispatch) => {
  dispatch({
    type: HIDE_TOASTER,
  })
}
