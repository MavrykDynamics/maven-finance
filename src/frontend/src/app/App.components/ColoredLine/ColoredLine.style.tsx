import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { PRIMARY, SECONDARY, TRANSPARENT } from './ColoredLine.constants'

export const ColoredLineStyled = styled.hr<{ theme: MavrykTheme }>`
  opacity: 0.5;

  &.${PRIMARY} {
    color: ${({ theme }) => theme.primaryColor};
    background-color: ${({ theme }) => theme.containerColor};
  }

  &.${SECONDARY} {
    color: ${({ theme }) => theme.primaryColor};
  }

  &.${TRANSPARENT} {
    color: ${({ theme }) => theme.textColor};
    background-color: initial;
  }
`
