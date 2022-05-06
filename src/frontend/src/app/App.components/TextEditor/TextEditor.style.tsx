import styled from 'styled-components/macro'
import { placeholderColor } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'

export const TextEditorContainer = styled.div<{ theme: MavrykTheme }>`
  border-radius: 10px;

  > div {
    background-color: ${({ theme }) => theme.placeholderColor};
    min-height: 200px;
    font-family: 'Metropolis', sans-serif;
    border-radius: 10px;
    border: none;
    direction: ltr;
  }
  .ButtonWrap__root___1EO_R > button {
    background-color: ${({ theme }) => theme.containerColor};
  }
`
