import styled from 'styled-components/macro'
import { backgroundColor, placeholderColor } from 'styles'

export const TextEditorContainer = styled.div`
  border-radius: 10px;

  > div {
    background-color: ${placeholderColor};
    min-height: 200px;
    font-family: 'Metropolis', sans-serif;
    border-radius: 10px;
    border: none;
    direction: ltr;
  }
  .ButtonWrap__root___1EO_R > button {
    background-color: ${backgroundColor};
  }
`
