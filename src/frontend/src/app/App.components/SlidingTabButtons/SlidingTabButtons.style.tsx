import styled, { keyframes } from 'styled-components/macro'

import { royalPurpleColor, darkColor, primaryColor } from '../../../styles'
import { BUTTON_RADIUS } from '../../../styles/constants'
import { MavrykTheme } from '../../../styles/interfaces'

export const clickWave = keyframes`
  from {
    box-shadow: 0 0 0 0 ${primaryColor};
  }
  to {
    box-shadow: 0 0 0 5px ${primaryColor}00;
  }
`

export const clickSlide = keyframes`
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(100px);
  }
`
export const SlidingTabButtonsStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${darkColor};
  border: 1px solid ${royalPurpleColor};
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  border-radius: 20px;

  > * {
    &:first-child {
      margin-left: 1px;
    }
    &:last-child {
      margin-right: 1px;
    }
  }
`

export const ButtonStyled = styled.button<{ buttonActive: boolean; theme: MavrykTheme }>`
  border: none;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  height: 36px;
  width: max-content;
  padding: 0 22px;
  border-radius: ${BUTTON_RADIUS};
  user-select: none;
  color: ${({ buttonActive, theme }) => (buttonActive ? theme.containerColor : theme.headerColor)};
  background-color: ${({ buttonActive, theme }) => (buttonActive ? theme.headerColor : 'transparent')};
  &.clicked {
    background-color: ${({ buttonActive, theme }) => (buttonActive ? theme.headerColor : 'transparent')};
  }

  &.loading {
    pointer-events: none;
    opacity: 0.8;
  }
`

export const ButtonText = styled.div<{ theme: MavrykTheme }>`
  > div {
    text-align: center;
    margin: auto;
    display: inline-block;
    font-weight: 600;
    font-size: 16px;
    line-height: 16px;
    vertical-align: top;
  }
  &.primary {
    color: ${({ theme }) => theme.textColor};
  }

  &.secondary {
    color: ${({ theme }) => theme.primaryColor};
  }

  &.transparent {
    color: ${({ theme }) => theme.primaryColor};
  }
`
const turn = keyframes`
  100% {
      transform: rotate(360deg);
  }
`

export const ButtonLoadingIcon = styled.svg<{ theme: MavrykTheme }>`
  width: 16px;
  height: 16px;
  margin-top: 4px;
  margin-right: 15px;
  vertical-align: sub;
  stroke: ${({ theme }) => theme.textColor};
  stroke-width: 1px;
  stroke-dashoffset: 94.248;
  stroke-dasharray: 47.124;
  animation: ${turn} 1.6s linear infinite forwards;

  &.primary {
    stroke: ${({ theme }) => theme.containerColor};
  }

  &.secondary {
    stroke: ${({ theme }) => theme.primaryColor};
  }

  &.transparent {
    stroke: ${({ theme }) => theme.textColor};
  }
`
