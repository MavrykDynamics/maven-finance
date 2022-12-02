import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import type { AppDispatch, GetState } from 'app/App.controller'

export const SHOW_EXIT_FEE_MODAL = 'SHOW_EXIT_FEE_MODAL'
export const showExitFeeModal = () => (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  dispatch({
    type: SHOW_EXIT_FEE_MODAL,
  })
}

export const HIDE_EXIT_FEE_MODAL = 'HIDE_EXIT_FEE_MODAL'
export const hideExitFeeModal = () => (dispatch: AppDispatch) => {
  dispatch({
    type: HIDE_EXIT_FEE_MODAL,
  })
}
