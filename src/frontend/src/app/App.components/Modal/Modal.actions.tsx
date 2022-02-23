export const SHOW_MODAL = 'SHOW_MODAL'
export const showModal = () => (dispatch: any) => {
  dispatch({
    type: SHOW_MODAL,
  })
}

export const HIDE_MODAL = 'HIDE_MODAL'
export const hideModal = () => (dispatch: any) => {
  dispatch({
    type: HIDE_MODAL,
  })
}
