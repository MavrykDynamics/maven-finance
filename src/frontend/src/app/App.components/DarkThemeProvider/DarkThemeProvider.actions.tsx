import { setItemInStorage } from '../../../utils/storage'
import { State } from '../../../reducers'
import { AppDispatch } from 'app/App.controller'

export const TOGGLE_DARK_THEME = 'TOGGLE_DARK_THEME'
export const toggleDarkTheme = () => (dispatch: AppDispatch, getState: () => State) => {
  const {
    preferences: { darkThemeEnabled },
  } = getState()

  setItemInStorage('theme', !darkThemeEnabled)
  dispatch({
    type: TOGGLE_DARK_THEME,
  })
}
