import styled, { css } from 'styled-components/macro'
import { ProgressBarStatus } from './ProgressBar.constants'
import { MavrykTheme } from '../../../styles/interfaces'

export const ProgressBarStyled = styled.div<{ status: ProgressBarStatus; theme: MavrykTheme }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 0px;
  z-index: 20;
  height: 2px;
  background-color: ${({ theme }) => theme.primaryColor};
  will-change: transform;
  transition: opacity 500ms ease-in-out;
  opacity: 0;

  ${(props) =>
    props.status === ProgressBarStatus.MOVING &&
    css`
      animation: progres 4s infinite linear;
      opacity: 1;
    `};

  ${(props) =>
    props.status === ProgressBarStatus.NO_DISPLAY &&
    css`
      opacity: 0;
    `};

  @keyframes progres {
    0% {
      width: 0%;
    }
    25% {
      width: 50%;
    }
    50% {
      width: 75%;
    }
    75% {
      width: 85%;
    }
    100% {
      width: 100%;
    }
  } ;
`
