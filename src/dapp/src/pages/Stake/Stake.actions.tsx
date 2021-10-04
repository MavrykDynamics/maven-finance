export const STAKE_REQUEST = 'STAKE_REQUEST'

export const stake = () => (dispatch: any) => {
  dispatch({
    type: STAKE_REQUEST,
  })
}
