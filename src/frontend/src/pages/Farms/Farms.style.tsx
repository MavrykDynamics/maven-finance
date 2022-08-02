import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

export const FarmsStyled = styled.div<{ theme: MavrykTheme }>`
  .farm-list {
    display: grid;
    gap: 30px;

    &.vertical {
      grid-template-columns: 1fr 1fr 1fr;
    }

    &.horizontal {
      gap: 20px;
    }
  }
`
