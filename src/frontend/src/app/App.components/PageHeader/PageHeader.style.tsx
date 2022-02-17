import styled, { keyframes } from 'styled-components/macro'

import { backgroundColor } from '../../../styles'

export const PageHeaderStyled = styled.div<{ backgroundImageSrc: string }>`
  background-image: url(${({ backgroundImageSrc }) => backgroundImageSrc});
  background-size: cover;
  background-position: top right;
  background-repeat: no-repeat;
  border-radius: 24px;
  width: 100%;
  height: 150px;
  position: relative;
`

export const PageHeaderTextArea = styled.div`
  margin: 40px 0 0 40px;
  position: fixed;
  max-width: 25%;
  > h1 {
    color: ${backgroundColor};
    font-size: 25px;
    margin: 0;
  }

  > p {
    color: ${backgroundColor};
    font-size: 14px;
    margin: 0;
  }
`

export const PageHeaderForegroundImageContainer = styled.div`
  width: 100%;
  height: 150px;
  display: flex;
  justify-content: flex-end;
  overflow: visible;
`

export const PageHeaderForegroundImage = styled.img<{ page: string; src: string }>`
  width: ${({ page }) => {
    switch (page) {
      case 'staking':
        return `70%`
      case 'dashboard':
        return '50%'
      case 'vaults':
        return '65%'
      default:
        return '100%'
    }
  }};
  height: ${({ page }) => {
    switch (page) {
      case 'farms':
        return '150px'
      default:
        return '180px'
    }
  }};
  /*
  TODO: Uncomment when starting to work on animation
  animation: {({ page }) => {
    switch (page) {
      case 'staking':
      case 'vaults':
        return {shakes} 3s linear infinite  //re-add the $ before {shakes} and outside back tiks 
      case 'warning':
        return ({ theme }) => theme.warningColor
      case 'error':
        return ({ theme }) => theme.downColor
      default:
        return null
    }
  }};
   */
`

/*
 * Animations for the headers
 */
const shakes = keyframes`
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
