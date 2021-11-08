export const SHOW_EXIT_FEE_MODAL = 'SHOW_EXIT_FEE_MODAL'
export const showExitFeeModal = () => (dispatch: any) => {
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

export const STAKE = 'STAKE'
export const stake =
  ({ amount }: { amount: number }) =>
  (dispatch: any) => {
    dispatch({
      type: STAKE,
      payload: { amount },
    })
  }
