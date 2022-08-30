import React from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { ThemeProvider } from 'styled-components'
import { darkMode, lightMode } from 'styles'

const DarkThemeProvider = ({ children }: { children?: JSX.Element | Array<JSX.Element> }) => {
  const { darkThemeEnabled } = useSelector((state: State) => state.preferences)
  return <ThemeProvider theme={darkThemeEnabled ? darkMode : lightMode}>{children}</ThemeProvider>
}

export default DarkThemeProvider
