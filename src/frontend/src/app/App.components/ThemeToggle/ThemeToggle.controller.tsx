import Toggle from 'react-toggle'
import { ThemeToggleIcon } from '../Menu/Menu.style'
import * as React from 'react'
import { toggleDarkTheme } from '../DarkThemeProvider/DarkThemeProvider.actions'
import { useDispatch, useSelector } from 'react-redux'
import { ThemeToggleStyle } from './ThemeToggle.style'

export const ThemeToggle = () => {
  const dispatch = useDispatch()
  const { darkThemeEnabled } = useSelector((state: any) => state.preferences)
  const handleToggleTheme = () => {
    dispatch(toggleDarkTheme())
  }
  return (
    <ThemeToggleStyle>
      <label>
        <Toggle
          defaultChecked={darkThemeEnabled}
          icons={{
            checked: (
              <ThemeToggleIcon>
                <use xlinkHref="/icons/sprites.svg#moon" />
              </ThemeToggleIcon>
            ),
            unchecked: (
              <ThemeToggleIcon>
                <use xlinkHref="/icons/sprites.svg#sun" />
              </ThemeToggleIcon>
            ),
          }}
          aria-label="Dark mode toggle"
          onChange={handleToggleTheme}
        />
      </label>
    </ThemeToggleStyle>
  )
}
