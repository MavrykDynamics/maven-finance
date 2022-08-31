import { AppDispatch, GetState } from 'app/App.controller'
import { showToaster } from '../Toaster/Toaster.actions'
import { ERROR } from '../Toaster/Toaster.constants'

export const SHOW_MODAL = 'SHOW_MODAL'
export const showModal = (kind: string) => (dispatch: AppDispatch, getState: GetState) => {
  const state = getState()

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }
  console.log('Here in set state')
  dispatch({
    type: SHOW_MODAL,
    kind,
  })
}

export const HIDE_MODAL = 'HIDE_MODAL'
export const hideModal = () => (dispatch: AppDispatch) => {
  dispatch({
    type: HIDE_MODAL,
  })
}
