import styled, { css, keyframes } from 'styled-components/macro'
import { backgroundColor } from 'styles'

const spin = keyframes` 
  0% { 
      transform: rotate(360deg);
  } 
  100% { 
      transform: rotate(0deg);
  } 
`

export const shakes = keyframes`
  10% {
    transform: translate(2px, 2px);
  }
  20% {
    transform: translate(3px, 2px);
  }
  30% {
    transform: translate(5px, 4px);
  }
  40% {
    transform: translate(3px, 3px);
  }
  50% {
    transform: translate(3px, 3px);
  }
  60% {
    transform: translate(4px, 3px);
  }
  70% {
    transform: translate(2px, 4px);
  }
  80% {
    transform: translate(3px, 3px);
  }
  90% {
    transform: translate(4px, 4px);
  }
  100% {
    transform: translate(0, 0);
  }
`

export const jet = keyframes`
  0% {
    transform: scale(1.0);
  }
  50% {
	  transform: scale(1.05);
  }
  100% {
    transform: scale(0.95);
  }
`

export const StakeHeaderStyled = styled.div`
  background: url('/images/clouds.svg'), radial-gradient(33.05% 130.68% at 69.09% 89.38%, #60558b 0%, #53487f 100%);
  background-size: contain;
  background-position: top right;
  background-repeat: no-repeat;
  border-radius: 10px;
  border-radius: 10px;
  width: 100%;
  height: 150px;
  position: relative;

  > h1 {
    color: ${backgroundColor};
    font-size: 25px;
    margin: 40px 0 0 40px;
  }

  > p {
    color: ${backgroundColor};
    font-size: 12px;
    margin: 0 0 0 40px;
  }
`

export const StakeHeaderPortal = styled.div`
  transform: scaleX(0.5);
  position: absolute;
  top: -20px;
  right: 200px;

  > img {
    animation: ${spin} 40s linear infinite;
    transform-style: preserve-3d;
  }
`

export const StakeHeaderAnimation = styled.div`
  position: absolute;
  top: -10px;
  right: 400px;
`

export const StakeHeaderShipGoing = styled.div`
  position: absolute;
  right: 400px;
`

export const StakeHeaderShipComing = styled.div`
  position: absolute;
  right: 0;
  opacity: 0;
`

export const StakeHeaderShip = styled.div`
  position: absolute;
  animation: ${shakes} 3s linear infinite;
`

export const StakeHeaderShipFlamePart = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  animation: ${jet} 2s ease alternate infinite;
`

export const StakeHeaderShipMainPart = styled.img`
  position: absolute;
  top: 0;
  left: 0;
`
