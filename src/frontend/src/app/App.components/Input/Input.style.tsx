import styled, { keyframes } from 'styled-components/macro'

import { MavrykTheme } from '../../../styles/interfaces'

export const InputStyled = styled.div`
  position: relative;
  width: 100%;
`

export const InputComponentContainer = styled.div<{ theme: MavrykTheme }>`
  display: block;
  position: relative;
`

export const InputComponent = styled.input<{ theme: MavrykTheme }>`
  width: 100%;
  height: 40px;
  background-color: ${({ theme }) => theme.backgroundColor};
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  margin: 0;
  color: ${({ theme }) => theme.headerColor};
  -webkit-appearance: none;
  appearance: none;
  display: block;
  position: relative;
  padding: 13px 16px 13px 20px;
  border-radius: 10px;
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  will-change: border-color, box-shadow;
  font-size: 14px;

  &.search {
    color: ${({ theme }) => theme.headerColor};
  }
  &::placeholder:not(.search) {
    color: ${({ theme }) => theme.inputPlaceholder};
  }

  &:disabled {
    color: ${({ theme }) => theme.subTextColor};
    opacity: 0.9;
  }

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.primaryColor}7F;
  }

  &:focus {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryColor}19;
    border-color: ${({ theme }) => theme.primaryColor}7F;
  }

  &.error {
    border-color: ${({ theme }) => theme.downColor};
    color: ${({ theme }) => theme.downColor};
    &:focus {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.downColor}7F;
    }
  }

  &.success {
    border: 1px solid ${({ theme }) => theme.upColor};
    color: ${({ theme }) => theme.upColor};
    &:focus {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.upColor}7F;
    }
  }
`

export const InputLabel = styled.div<{ theme: MavrykTheme }>`
  position: absolute;
  right: 35px;
  top: 18px;
  color: ${({ theme }) => theme.headerColor};
  font-size: 18px;
  font-weight: 600;

  &.error {
    color: ${({ theme }) => theme.downColor};
  }

  &.success {
    color: ${({ theme }) => theme.upColor};
  }
`

const zoomIn = keyframes`
  from {
    transform:scale(.2);
    opacity:0
  }
  to {
    transform:scale(1);
    opacity:1
  }
`

export const InputStatus = styled.div`
  display: block;
  position: absolute;
  top: 14px;
  right: 10px;
  z-index: 1;
  line-height: 13px;
  text-align: center;
  visibility: visible;
  pointer-events: none;
  will-change: transform, opacity;

  &.error {
    background-image: url('/icons/input-error.svg');
    animation: ${zoomIn} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
    height: 15px;
    width: 15px;
  }

  &.success {
    background-image: url('/icons/input-success.svg');
    animation: ${zoomIn} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
    height: 12px;
    width: 17px;
  }
`

export const InputIcon = styled.svg<{ theme: MavrykTheme }>`
  display: block;
  position: absolute;
  top: 20px;
  left: 10px;
  z-index: 1;
  width: 20px;
  height: 20px;
  margin-top: -10px;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  visibility: visible;
  pointer-events: none;
  stroke: ${({ theme }) => theme.backgroundTextColor};
`

const slideDown = keyframes`
  from {
    transform: translate3d(0, -10px, 0);
    opacity:0
  }
  to {
    transform: translate3d(0, 0px, 0);
    opacity:1
  }
`

export const InputErrorMessage = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.downColor};
  line-height: 24px;
  will-change: transform, opacity;
  animation: ${slideDown} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:first-letter {
    text-transform: uppercase;
  }
`

export const InputSpacer = styled.div`
  height: 10px;
`
