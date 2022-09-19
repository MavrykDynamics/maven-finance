import styled, { css, keyframes } from 'styled-components/macro'

import { primaryColor, darkColor, skyColor, cyanColor } from '../../../styles'
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

export const ButtonStyled = styled.button<{ theme: MavrykTheme }>`
  padding: 0;
  height: 50px;
  border: none;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  border-radius: ${BUTTON_RADIUS};
  will-change: box-shadow;
  width: 100%;
  user-select: none;

  &:hover {
    opacity: 0.8;
  }

  &.disabled {
    opacity: 0.6;
    cursor: default;
  }

  &.clicked {
    animation: ${clickWave} 1250ms cubic-bezier(0.19, 1, 0.22, 1);
    animation-fill-mode: forwards;
  }

  &.primary:not(.disabled) {
    color: ${({ theme }) => theme.containerColor};
    background-color: ${({ theme }) => theme.primaryColor};
  }

  &.secondary {
    color: ${({ theme }) => theme.primaryColor};
    background-color: ${({ theme }) => theme.containerColor};
    border: 1.5px solid ${({ theme }) => theme.primaryColor};
  }

  &.transparent {
    color: ${({ theme }) => theme.textColor};
    background-color: ${({ theme }) => theme.containerColor};
  }

  &.loading {
    pointer-events: none;
    opacity: 0.8;
  }

  &.votingFor {
    color: ${darkColor};
    background-color: ${({ theme }) => theme.upColor};
  }
  &.votingAgainst {
    color: ${darkColor};
    background-color: ${({ theme }) => theme.downColor};
  }
  &.votingAbstain {
    color: ${darkColor};
    background-color: ${skyColor};
  }

  &.actionPrimary {
    color: ${({ theme }) => theme.containerColor};
    background-color: ${({ theme }) => theme.actionPrimaryBtnColor};

    &.fill {
      svg {
        fill: ${({ theme }) => theme.containerColor};
        stroke: none;
      }
    }

    &.noStroke {
      svg {
        stroke: none;
      }
    }
  }

  &.actionSecondary {
    color: ${({ theme }) => theme.actionPrimaryBtnColor};
    background-color: transparent;
    border: 2px solid ${({ theme }) => theme.actionPrimaryBtnColor};

    &.close {
      svg {
        stroke: ${({ theme }) => theme.downColor};
      }
    }

    &.fill {
      svg {
        stroke: none;
        fill: ${({ theme }) => theme.actionPrimaryBtnColor};
      }
    }
  }

  &.button-circle {
    width: 50px;
    flex-shrink: 0;

    svg {
      margin-right: 0;
      stroke: none;
    }

    &.actionSecondary svg {
      fill: ${({ theme }) => theme.actionPrimaryBtnColor};
    }
  }

  &.connect-wallet-details {
    display: flex;
    align-items: center;
    position: relative;
    margin-right: 15px;
    color: ${cyanColor};
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }

  &.theme-btn {
    height: 38px;
    width: 31%;
    border: 1px solid ${({ theme }) => theme.cardBorderColor};
    color: ${({ theme }) => theme.headerColor};
    border-radius: 8px;
    transition: 0.4s all;

    &:hover,
    &.selected {
      border: 1px solid ${({ theme }) => theme.navLinkSubTitleActive};
      color: ${({ theme }) => theme.navLinkSubTitleActive};
    }
  }

  &.change-wallet {
    width: 185px;
  }
`

export const ButtonText = styled.div<{ theme: MavrykTheme }>`
  > div {
    text-align: center;
    margin: auto;
    display: inline-block;
    line-height: 24px;
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

  &.votingFor {
    color: ${darkColor};
  }
  &.votingAgainst {
    color: ${darkColor};
  }
  &.votingAbstain {
    color: ${darkColor};
  }
`

export const ButtonIcon = styled.svg<{ theme: MavrykTheme; strokeWidth?: number }>`
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: sub;
  margin-right: 11px;

  &.primary {
    stroke: ${({ theme }) => theme.containerColor};
  }

  &.secondary {
    stroke: ${({ theme }) => theme.primaryColor};
  }

  &.transparent {
    stroke: ${({ theme }) => theme.textColor};
  }
  &.glassBroken {
    stroke: ${({ theme }) => theme.downColor};
  }

  &.actionPrimary {
    stroke: ${({ theme }) => theme.containerColor};
  }

  &.actionSecondary {
    stroke: ${({ theme }) => theme.actionPrimaryBtnColor};
  }

  ${({ strokeWidth }) =>
    strokeWidth
      ? css`
          stroke-width: ${strokeWidth};
        `
      : ''}
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

  &.actionPrimary {
    stroke: ${({ theme }) => theme.containerColor};
  }

  &.actionSecondary {
    stroke: ${({ theme }) => theme.primaryColor};
  }
`
