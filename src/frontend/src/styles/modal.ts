import styled from 'styled-components/macro'

import { cyanColor, containerColor } from '../styles/colors'
import { MavrykTheme } from './interfaces'

export const ModalStyled = styled.div<{ showing: boolean }>`
  position: fixed;
  z-index: 11;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  transition: opacity 0.2s ease-in-out;
  opacity: ${(props) => (props.showing ? 1 : 0)};
  will-change: opacity;
  display: ${(props) => (props.showing ? 'initial' : 'none')};
`

export const ModalMask = styled.div<{ showing: boolean }>`
  width: 100%;
  height: 100%;
  background-color: black;
  opacity: 0.5;
`

export const ModalCard = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
`

export const ModalCardContent = styled.div<{ width?: number; height?: number; theme: MavrykTheme }>`
  position: relative;
  background: ${containerColor};
  border-radius: 10px;
  min-height: ${(props) => (props.height ? `${props.height}vh` : 'initial')};
  max-height: calc(100vh - 50px);
  min-width: ${(props) => (props.width ? `${props.width}vw` : 'initial')};
  max-width: 90vw;
  border: 1px solid ${cyanColor};
  padding: 30px;
  overflow: auto;

  p {
    line-height: 1.4;
  }

  h1 {
    font-weight: 600;
    font-size: 22px;
    line-height: 22px;
    color: ${({ theme }) => theme.textColor};
    margin: 0;
    margin-bottom: 20px;
  }

  &.farm-modal {
    width: 500px;
    height: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 40px;
  }

  &.modal-roi {
    padding: 0;
    padding-right: 5px;

    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar-thumb {
      border-right: 3px solid transparent;
      border-top: 3px solid transparent;
      border-bottom: 3px solid transparent;
      background-clip: padding-box;
    }
  }

  .text-box {
    padding-right: 15px;
    max-height: 460px;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track { 
      background: #271C60;
      border-radius: 20px;
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.cardBorderColor};
      border-radius: 20px;
    }
  }

  .shadow-box {
    position: absolute;
    bottom: 25px;
    height: 50px;
    width: 85%;
    background: linear-gradient(to bottom, transparent 0%, #160E3F 60%);
  }
`

export const ModalClose = styled.div<{ theme: MavrykTheme }>`
  position: absolute;
  top: 0;
  right: -40px;
  cursor: pointer;

  > svg {
    height: 24px;
    width: 24px;
    stroke: ${({ theme }) => theme.subTextColor};
  }
`
