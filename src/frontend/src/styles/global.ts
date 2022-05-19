import { createGlobalStyle } from 'styled-components/macro'

import { darkCianColor, headerColor } from '../styles/colors'
import { MavrykTheme } from './interfaces'

export const GlobalStyle = createGlobalStyle<{ theme: MavrykTheme }>`
* {
  box-sizing: border-box;
}

body {
  font-family: 'Metropolis', Helvetica, Arial, sans-serif;
  font-display: optional;
  margin: 0;
  padding: 0;
  background-color: ${({ theme }) => theme.backgroundColor};
  color: ${({ theme }) => theme.textColor};
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-width: 1250px;
}

h1 {
  font-weight: bold;
  display: inline-block;
  margin: 30px auto;
  color: ${headerColor};
  font-weight: 700;
  font-size: 25px;

  @media (max-width: 700px) {   
    font-size: 30px;
    margin: 20px auto;
  }

  &::after{
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background-color: ${darkCianColor};
    margin: 7px 0 10px 1px;
  }
}

button {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
}

h2 {
  font-size: 20px;
  font-weight: normal;
  display: block;
  margin: 0;
}

h3 {
  font-size: 30px;
  font-weight: normal;
  display: block;
  margin: 0;
}

h4 {
  font-size: 14px;
  font-weight: normal;
  margin: 0;
  
  &.primary {
    color: ${({ theme }) => theme.textColor};
  }

  &.secondary {
    color: ${({ theme }) => theme.subTextColor};
  }

  &.transparent {
    color: ${({ theme }) => theme.textColor};
  }
  
  &.bold {
    font-weight: bold;
  }
}

input {
  color: ${({ theme }) => theme.textColor};
  font-size: 14px;
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

input[type='number'] {
  -moz-appearance: textfield;
}

::placeholder {
  color:  ${({ theme }) => theme.placeholderColor};
  font-size: 14px;
}

*:focus {
  outline: none;
}

a {
  color: ${({ theme }) => theme.textColor};
  text-decoration: none;
  opacity: 1;
  transition: opacity 0.15s ease-in-out-out;
  will-change: opacity;
}

a:hover {
  opacity: 0.9;
}

p {
    font-family: "Metropolis", sans-serif;
    display: block;
    margin-block-start: 10px;
    margin-block-end: 10px;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
}

.react-toggle {
  touch-action: pan-x;  

  display: inline-block;
  position: relative;
  cursor: pointer;
  background-color: transparent;
  border: 0;
  padding: 0;

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  -webkit-tap-highlight-color: rgba(0,0,0,0);
  -webkit-tap-highlight-color: transparent;
}

.react-toggle-screenreader-only {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
}

.react-toggle--disabled {
  cursor: not-allowed;
  opacity: 0.5;
  -webkit-transition: opacity 0.25s;
  transition: opacity 0.25s;
}

.react-toggle-track {
  width: 50px;
  height: 24px;
  font-size: 12px;
  padding: 0;
  border-radius: 30px;
  background-color: ${({ theme }) => theme.secondaryColor};
  -webkit-transition: all 0.2s ease;
  -moz-transition: all 0.2s ease;
  transition: all 0.2s ease;
}

.react-toggle:hover:not(.react-toggle--disabled) .react-toggle-track {
  background-color: ${({ theme }) => theme.secondaryColor};
}

.react-toggle--checked .react-toggle-track {
  background-color: ${({ theme }) => theme.containerColor};
}

.react-toggle--checked:hover:not(.react-toggle--disabled) .react-toggle-track {
  background-color: ${({ theme }) => theme.containerColor};
}

.react-toggle-track-check {
  position: absolute;
  width: 18px;
  height: 18px;
  top: 0px;
  bottom: 0px;
  margin-top: auto;
  margin-bottom: auto;
  line-height: 10px;
  left: 6px;
  opacity: 0;
  -webkit-transition: opacity 0.25s ease;
  -moz-transition: opacity 0.25s ease;
  transition: opacity 0.25s ease;
}

.react-toggle--checked .react-toggle-track-check {
  opacity: 1;
  -webkit-transition: opacity 0.25s ease;
  -moz-transition: opacity 0.25s ease;
  transition: opacity 0.25s ease;
}

.react-toggle-track-x {
  position: absolute;
  width: 18px;
  height: 18px;
  top: 0px;
  bottom: 0px;
  margin-top: auto;
  margin-bottom: auto;
  line-height: 10px;
  right: 6px;
  opacity: 1;
  -webkit-transition: opacity 0.25s ease;
  -moz-transition: opacity 0.25s ease;
  transition: opacity 0.25s ease;
}

.react-toggle--checked .react-toggle-track-x {
  opacity: 0;
}

.react-toggle-thumb {
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0ms;
  position: absolute;
  top: 1px;
  left: 1px;
  width: 22px;
  height: 22px;
  border: 1px solid #FAFAFA;
  border-radius: 50%;
  background-color: #FAFAFA;

  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;

  // -webkit-transition: all 0.25s ease;
  // -moz-transition: all 0.25s ease;
  // transition: all 0.25s ease;
}

.react-toggle--checked .react-toggle-thumb {
  left: 27px;
  border-color: #FAFAFA;
}

.react-toggle--focus .react-toggle-thumb {
  -webkit-box-shadow: 0px 0px 3px 2px ${({ theme }) => theme.secondaryColor};
  -moz-box-shadow: 0px 0px 3px 2px ${({ theme }) => theme.secondaryColor};
  box-shadow: 0px 0px 2px 3px ${({ theme }) => theme.secondaryColor};
}

.react-toggle:active:not(.react-toggle--disabled) .react-toggle-thumb {
  -webkit-box-shadow: 0px 0px 5px 5px ${({ theme }) => theme.secondaryColor};
  -moz-box-shadow: 0px 0px 5px 5px ${({ theme }) => theme.secondaryColor};
  box-shadow: 0px 0px 5px 5px ${({ theme }) => theme.secondaryColor};
}

`
