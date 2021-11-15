export const SHOW_EXIT_FEE_MODAL = 'SHOW_EXIT_FEE_MODAL'
export const showExitFeeModal = (amount: number) => (dispatch: any) => {
  dispatch({
    type: SHOW_EXIT_FEE_MODAL,
    amount,
  })
}

export const HIDE_EXIT_FEE_MODAL = 'HIDE_EXIT_FEE_MODAL'
export const hideExitFeeModal = () => (dispatch: any) => {
  dispatch({
    type: HIDE_EXIT_FEE_MODAL,
  })
}
