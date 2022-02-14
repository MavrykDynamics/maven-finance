export const TOGGLE_DARK_THEME = 'TOGGLE_DARK_THEME'
export const toggleDarkTheme = () => (dispatch: any, getState: any) => {
  dispatch({
    type: TOGGLE_DARK_THEME,
  })
}
