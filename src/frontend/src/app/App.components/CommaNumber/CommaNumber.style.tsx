import styled, { keyframes } from 'styled-components/macro'
import { backgroundColor, primaryColor, textColor } from '../../../styles'

const turn = keyframes`
  100% {
      transform: rotate(360deg);
  }
`

export const LoadingIcon = styled.svg`
  width: 20px;
  height: 20px;
  vertical-align: sub;
  stroke: ${textColor};
  stroke-width: 1px;
  stroke-dashoffset: 94.248;
  stroke-dasharray: 47.124;
  animation: ${turn} 1.6s linear infinite forwards;

  &.primary {
    stroke: ${backgroundColor};
  }

  &.secondary {
    stroke: ${primaryColor};
  }

  &.transparent {
    stroke: ${textColor};
  }
`
