import { setItemInStorage } from '../../../utils/storage'
import { State } from '../../../reducers'
import { AppDispatch } from 'app/App.controller'

export const LIGHT_THEME = 'light'
export const SPACE_THEME = 'space'
export const DARK_THEME = 'dark'

export type ThemeType = typeof LIGHT_THEME | typeof SPACE_THEME | typeof DARK_THEME

export const TOGGLE_DARK_THEME = 'TOGGLE_DARK_THEME'
export const themeSetterAction = (newThemeSelected: ThemeType) => (dispatch: AppDispatch) => {
  setItemInStorage('theme', newThemeSelected)
  dispatch({
    type: TOGGLE_DARK_THEME,
    newThemeSelected,
  })
}
