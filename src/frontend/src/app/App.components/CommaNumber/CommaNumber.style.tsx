import styled, { keyframes } from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

const turn = keyframes`
  100% {
      transform: rotate(360deg);
  }
`

export const LoadingIcon = styled.svg<{ theme: MavrykTheme }>`
  width: 20px;
  height: 20px;
  vertical-align: sub;
  stroke: ${({ theme }) => theme.textColor};
  stroke-width: 1px;
  stroke-dashoffset: 94.248;
  stroke-dasharray: 47.124;
  animation: ${turn} 1.6s linear infinite forwards;

  &.primary {
    stroke: ${({ theme }) => theme.backgroundColor};
  }

  &.secondary {
    stroke: ${({ theme }) => theme.primaryColor};
  }

  &.transparent {
    stroke: ${({ theme }) => theme.textColor};
  }
`
