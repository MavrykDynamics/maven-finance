import { TOGGLE_DARK_THEME } from '../app/App.components/DarkThemeProvider/DarkThemeProvider.actions'

export interface PreferencesState {
  darkThemeEnabled: boolean
}

const preferencesDefaultState: PreferencesState = {
  darkThemeEnabled: false,
}

export function preferences(state = preferencesDefaultState, action: any): PreferencesState {
  switch (action.type) {
    case TOGGLE_DARK_THEME:
      return { ...state, darkThemeEnabled: !state.darkThemeEnabled }
    default:
      return state
  }
}
