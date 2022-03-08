import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'

export const SHOW_EXIT_FEE_MODAL = 'SHOW_EXIT_FEE_MODAL'
export const showExitFeeModal = () => (dispatch: any, getState: any) => {
  const state: State = getState()

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  dispatch({
    type: SHOW_EXIT_FEE_MODAL,
  })
}

export const HIDE_EXIT_FEE_MODAL = 'HIDE_EXIT_FEE_MODAL'
export const hideExitFeeModal = () => (dispatch: any) => {
  dispatch({
    type: HIDE_EXIT_FEE_MODAL,
  })
}
