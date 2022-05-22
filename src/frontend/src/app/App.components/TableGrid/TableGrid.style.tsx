import styled from 'styled-components/macro'
import { cianColor, darkColor } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const TableGridWrap = styled.div<{ theme: MavrykTheme }>`
  td {
    background-color: ${darkColor};
  }

  input {
    color: ${cianColor};
    background-color: transparent;
    border: none;
  }
`
