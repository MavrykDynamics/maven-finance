import { createGlobalStyle } from 'styled-components/macro'

import { placeholderColor, primaryColor, subTextColor, textColor } from './colors'

export const GlobalStyle = createGlobalStyle`
* {
  box-sizing: border-box;
}

body {
  font-family: 'Metropolis', Helvetica, Arial, sans-serif;
  font-display: optional;
  margin: 0;
  padding: 0;
  background-color: #FFF;
  color: ${textColor};
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1 {
  font-size: 40px;
  font-weight: bold;
  display: inline-block;
  margin: 30px auto;
  color: ${subTextColor};

  @media (max-width: 700px) {   
    font-size: 30px;
    margin: 20px auto;
  }

  &::after{
    content: '';
    display: block;
    width: 80px;
    height: 5px;
    background-color: #7068AA;
    margin: 7px 0 10px 1px;
  }
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
    color: ${primaryColor};
  }

  &.secondary {
    color: ${subTextColor};
  }

  &.transparent {
    color: ${textColor};
    background-color: initial;
  }
  
  &.bold {
    font-weight: bold;
  }
}

input {
  color: ${textColor};
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
  color: ${placeholderColor};
  font-size: 14px;
}

*:focus {
  outline: none;
}

a {
  color: ${textColor};
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
`
