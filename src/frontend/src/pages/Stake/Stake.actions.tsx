export const STAKE_REQUEST = 'STAKE_REQUEST'

export const stakeAnim = () => (dispatch: any) => {
  dispatch({
    type: STAKE_REQUEST,
  })
}
