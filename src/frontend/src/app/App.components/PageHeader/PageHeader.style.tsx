import styled, { keyframes } from 'styled-components/macro'

import { backgroundColor } from '../../../styles'

export const PageHeaderStyled = styled.div<{ backgroundImageSrc: string }>`
  background-image: url(${({ backgroundImageSrc }) => backgroundImageSrc});
  background-size: cover;
  background-position: top right;
  background-repeat: no-repeat;
  border-radius: 15px;
  width: 100%;
  height: 160px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  overflow: visible;
  padding: 0 0 0 40px;
`

export const PageHeaderTextArea = styled.div`
  max-width: 45%;
  width: max-content;
  overflow: visible;
  > h1 {
    color: ${backgroundColor};
    font-size: 25px;
    margin: 0;

    &::after {
      background-color: #ff8486;
    }
  }

  > p {
    color: ${backgroundColor};
    font-size: 14px;
    margin: 0;
  }
`

export const PageHeaderForegroundImageContainer = styled.div`
  width: fit-content;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: self-end;
  overflow: visible;
`

export const PageHeaderForegroundImage = styled.img<{ page: string; src: string }>`
  width: ${({ page }) => {
    switch (page) {
      case 'governance':
      case 'dashboard':
      case 'staking':
        return 'fit-content'
      case 'vaults':
      default:
        return 'fit-content'
    }
  }};
  height: ${({ page }) => {
    switch (page) {
      case 'farms':
        return '150px'
      case 'dashboard':
        return '160px'
      default:
        return '160px'
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
