import { TOGGLE_DARK_THEME } from '../app/App.components/DarkThemeProvider/DarkThemeProvider.actions'
import { GET_HEAD_DATA } from '../app/App.components/Menu/Menu.actions'
import { getItemFromStorage } from '../utils/storage'

export interface PreferencesState {
  darkThemeEnabled: boolean
  headData?: any
}

const preferencesDefaultState: PreferencesState = {
  darkThemeEnabled: getItemFromStorage('theme') || true,
}

export function preferences(state = preferencesDefaultState, action: any): PreferencesState {
  switch (action.type) {
    case TOGGLE_DARK_THEME:
      return { ...state, darkThemeEnabled: !state.darkThemeEnabled }
    case GET_HEAD_DATA:
      return { ...state, headData: action.headData }
    default:
      return state
  }
}
