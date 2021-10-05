import styled, { keyframes } from 'styled-components/macro'

import { primaryColor, textColor, backgroundColor } from '../../../styles'

export const clickWave = keyframes`
  from {
    box-shadow: 0 0 0 0 ${primaryColor};
  }
  to {
    box-shadow: 0 0 0 5px ${primaryColor}00;
  }
`

export const ButtonStyled = styled.button`
  padding: 0;
  height: 50px;
  border: none;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  will-change: box-shadow;
  width: 100%;
  user-select: none;

  &.clicked {
    animation: ${clickWave} 1250ms cubic-bezier(0.19, 1, 0.22, 1);
    animation-fill-mode: forwards;
  }

  &.primary {
    color: ${backgroundColor};
    background-color: ${primaryColor};
  }

  &.secondary {
    color: ${primaryColor};
    background-color: initial;
    border: 1.5px solid ${primaryColor};
  }

  &.transparent {
    color: ${textColor};
    background-color: initial;
  }

  &.loading {
    pointer-events: none;
    opacity: 0.8;
  }
`

export const ButtonText = styled.div`
  > div {
    text-align: center;
    margin: auto;
    display: inline-block;
    line-height: 24px;
    vertical-align: top;
  }
`

export const ButtonIcon = styled.svg`
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: sub;
  margin-right: 15px;

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

const turn = keyframes`
  100% {
      transform: rotate(360deg);
  }
`

export const ButtonLoadingIcon = styled.svg`
  width: 16px;
  height: 16px;
  margin-top: 4px;
  margin-right: 15px;
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
