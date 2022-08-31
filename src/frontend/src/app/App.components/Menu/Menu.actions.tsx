import { AppDispatch, GetState } from 'app/App.controller'
import { getChainInfo } from '../../../utils/api'

export const GET_HEAD_DATA = 'SET_HEAD_DATA'
export const getHeadData = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state = getState()
  const headData = await getChainInfo()
  if (JSON.stringify(state.preferences.headData) !== JSON.stringify(headData)) {
    dispatch({
      type: GET_HEAD_DATA,
      headData,
    })
  }
}

export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR'
export const toggleSidebarCollapsing = (isOpened?: boolean) => (dispatch: AppDispatch, getState: GetState) => {
  const { preferences } = getState()
  dispatch({
    type: TOGGLE_SIDEBAR,
    sidebarOpened: isOpened ?? !preferences.sidebarOpened,
  })
}
