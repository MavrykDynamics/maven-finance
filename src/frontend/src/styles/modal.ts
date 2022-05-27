import styled from 'styled-components/macro'

import { cyanColor, middleColor } from '../styles/colors'
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
`

export const ModalCardContent = styled.div<{ width?: number; height?: number; theme: MavrykTheme }>`
  background: ${middleColor};
  border-radius: 10px;
  min-height: ${(props) => (props.height ? `${props.height}vh` : 'initial')};
  max-height: calc(90vh - 50px);
  min-width: ${(props) => (props.width ? `${props.width}vw` : 'initial')};
  max-width: 90vw;
  border: 1px solid ${cyanColor};
  padding: 30px;

  h1 {
    font-weight: 700;
    font-size: 25px;
    line-height: 25px;
    color: ${({ theme }) => theme.headerColor};
    margin: 0;
    margin-bottom: 21px;
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
