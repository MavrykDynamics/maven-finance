import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const ColoredLineStyled = styled.hr<{ theme: MavrykTheme }>`
  opacity: 0.5;

  &.primary {
    color: ${({ theme }) => theme.primaryColor};
    background-color: ${({ theme }) => theme.containerColor};
  }

  &.secondary {
    color: ${({ theme }) => theme.primaryColor};
  }

  &.transparent {
    color: ${({ theme }) => theme.textColor};
    background-color: initial;
  }
`
