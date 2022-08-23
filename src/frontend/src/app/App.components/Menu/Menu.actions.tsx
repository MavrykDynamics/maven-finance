import { State } from 'reducers'
import { getChainInfo } from '../../../utils/api'

export const GET_HEAD_DATA = 'SET_HEAD_DATA'
export const getHeadData = () => async (dispatch: any, getState: any) => {
  const state: State = getState()
  const headData = await getChainInfo()
  if (JSON.stringify(state.preferences.headData) !== JSON.stringify(headData)) {
    dispatch({
      type: GET_HEAD_DATA,
      headData,
    })
  }
}

export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR'
export const toggleSidebarCollapsing = (isOpened?: boolean) => (dispatch: any, getState: () => State) => {
  const { preferences } = getState()
  dispatch({
    type: TOGGLE_SIDEBAR,
    sidebarOpened: isOpened ?? !preferences.sidebarOpened,
  })
}
