import { setItemInStorage } from '../../../utils/storage'
import { State } from '../../../reducers'

export const TOGGLE_DARK_THEME = 'TOGGLE_DARK_THEME'
export const toggleDarkTheme = () => (dispatch: any, getState: any) => {
  const state: State = getState()

  setItemInStorage('theme', !state.preferences.darkThemeEnabled)
  dispatch({
    type: TOGGLE_DARK_THEME,
  })
}
