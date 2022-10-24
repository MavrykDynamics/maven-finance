import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

export const FarmsStyled = styled.div<{ theme: MavrykTheme }>`
  .farm-list {
    display: grid;
    gap: 30px;

    &.vertical {
      grid-template-columns: repeat(3, 31.5%);
      align-items: baseline;
    }

    &.horizontal {
      gap: 20px;
    }
  }
`
