import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

export const DoormanInfoStyled = styled.div<{ theme: MavrykTheme }>`
  display: grid;
  grid-template-columns: 4fr 2fr;

  > div {
    &:nth-of-type(1) {
      margin-right: 30px;
    }
  }
`
