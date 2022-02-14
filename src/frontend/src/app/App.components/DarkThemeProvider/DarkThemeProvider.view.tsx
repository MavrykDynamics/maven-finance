import React from 'react'
import { useSelector } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { darkMode, lightMode } from 'styles'

const DarkThemeProvider = ({ children }: any) => {
  const { darkThemeEnabled } = useSelector((state: any) => state.preferences)
  return <ThemeProvider theme={darkThemeEnabled ? darkMode : lightMode}>{children}</ThemeProvider>
}

export default DarkThemeProvider
