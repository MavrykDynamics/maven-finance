import React from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { ThemeProvider } from 'styled-components'
import themeColors from 'styles/colors'

const DarkThemeProvider = ({ children }: { children?: JSX.Element | Array<JSX.Element> }) => {
  const { themeSelected } = useSelector((state: State) => state.preferences)
  return <ThemeProvider theme={themeColors[themeSelected]}>{children}</ThemeProvider>
}

export default DarkThemeProvider
