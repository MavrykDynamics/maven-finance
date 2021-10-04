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

export const StakeHeaderShip = styled.img`
  position: absolute;
  top: 23px;
  right: 400px;
`
