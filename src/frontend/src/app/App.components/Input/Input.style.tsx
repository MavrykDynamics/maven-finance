import styled, { keyframes } from 'styled-components/macro'

// prettier-ignore
import { backgroundTextColor, downColor, placeholderColor, primaryColor, subTextColor, upColor, selectedColor } from '../../../styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const InputStyled = styled.div`
  position: relative;
  margin-bottom: 5px;
`

export const InputComponent = styled.input<{ theme: MavrykTheme }>`
  width: 100%;
  height: 50px;
  background-color: ${({ theme }) => theme.placeholderColor};
  font-weight: 600;
  border: none;
  margin: 10px 0;
  color: ${({ theme }) => theme.subTextColor};
  -webkit-appearance: none;
  appearance: none;
  display: block;
  position: relative;
  padding: 12px 16px 12px 16px;
  border-radius: 6px;
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  will-change: border-color, box-shadow;

  &::placeholder {
    color: ${({ theme }) => theme.subTextColor};
  }
  &:disabled {
    background: ${({ theme }) => theme.backgroundTextColor};
    color: ${({ theme }) => theme.subTextColor};
  }

  &:hover {
    border-color: ${({ theme }) => theme.primaryColor}7F;
  }

  &:focus {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryColor}19;
    border-color: ${({ theme }) => theme.primaryColor}7F;
  }

  &.error {
    border-color: ${({ theme }) => theme.downColor};

    &:focus {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.downColor}7F;
    }
  }

  &.success {
    border-color: ${({ theme }) => theme.upColor};

    &:focus {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.upColor}7F;
    }
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
  top: 20px;
  right: 10px;
  z-index: 1;
  width: 20px;
  height: 20px;
  margin-top: -10px;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  visibility: visible;
  pointer-events: none;
  will-change: transform, opacity;

  &.error {
    background-image: url('/icons/input-error.svg');
    animation: ${zoomIn} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
  }

  &.success {
    background-image: url('/icons/input-success.svg');
    animation: ${zoomIn} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
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
