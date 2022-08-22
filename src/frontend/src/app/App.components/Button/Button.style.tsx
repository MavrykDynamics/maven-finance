import styled, { keyframes } from 'styled-components/macro'

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

  &.glassBroken,
  button:disabled,
  button[disabled] {
    border: 1px solid ${({ theme }) => theme.downColor};
    background-color: ${({ theme }) => theme.containerColor};
    color: ${({ theme }) => theme.downColor};
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
  }

  &.actionSecondary {
    color: ${({ theme }) => theme.actionPrimaryBtnColor};
    background-color: transparent;
    border: 2px solid ${({ theme }) => theme.actionPrimaryBtnColor};
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
    width: fit-content;
    padding-right: 15px;
    display: flex;
    align-items: center;
    position: relative;
    margin-right: 10px;
    padding-right: auto;
    color: ${cyanColor};
    opacity: 0.7;

    &::before {
      position: absolute;
      content: '';
      background-image: url("data:image/svg+xml,%3Csvg width='6' height='12' viewBox='0 0 6 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0.779462 11.8032C0.611967 11.6814 0.574936 11.4469 0.69675 11.2794L4.53634 5.99997L0.69675 0.720537C0.574936 0.553042 0.611967 0.318511 0.779462 0.196697C0.946957 0.0748825 1.18149 0.111914 1.3033 0.279408L5.3033 5.77941C5.39893 5.9109 5.39893 6.08904 5.3033 6.22054L1.3033 11.7205C1.18149 11.888 0.946957 11.9251 0.779462 11.8032Z' fill='%238D86EB'/%3E%3C/svg%3E%0A");
      background-repeat: no-repeat;
      width: 8px;
      height: 13px;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
    }

    &:hover {
      opacity: 1;
      &::before {
        background-image: url("data:image/svg+xml,%3Csvg width='6' height='12' viewBox='0 0 6 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0.779462 11.8032C0.611967 11.6814 0.574936 11.4469 0.69675 11.2794L4.53634 5.99997L0.69675 0.720537C0.574936 0.553042 0.611967 0.318511 0.779462 0.196697C0.946957 0.0748825 1.18149 0.111914 1.3033 0.279408L5.3033 5.77941C5.39893 5.9109 5.39893 6.08904 5.3033 6.22054L1.3033 11.7205C1.18149 11.888 0.946957 11.9251 0.779462 11.8032Z' fill='%2386D4C9'/%3E%3C/svg%3E%0A");
      }
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

export const ButtonIcon = styled.svg<{ theme: MavrykTheme }>`
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: sub;
  margin-right: 15px;

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
