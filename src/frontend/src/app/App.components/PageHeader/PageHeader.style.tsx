import styled from 'styled-components/macro'

import { whiteColor } from '../../../styles'

export const PageHeaderStyled = styled.div<{ backgroundImageSrc: string }>`
  width: 100%;
  height: 160px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  overflow: visible;
  padding: 0 0 0 40px;
  position: relative;

  &::before {
    background-image: url(${({ backgroundImageSrc }) => backgroundImageSrc}),
      linear-gradient(
        90deg,
        #38237c 0%,
        #39277d 15%,
        #3f3383 30%,
        #48488c 45%,
        #556598 60%,
        #658aa9 76%,
        #79b8bc 92%,
        #86d4c9 100%
      );
    background-size: contain;
    background-position: bottom left;
    background-repeat: no-repeat;
    border-radius: 15px;
    content: '';
    position: absolute;
    width: 100%;
    height: 150px;
    z-index: -1;
    bottom: 0;
    left: 0;
  }
`

export const PageHeaderTextArea = styled.div`
  max-width: 45%;
  width: max-content;
  overflow: visible;
  padding-top: 10px;

  > h1 {
    color: ${whiteColor};
    font-size: 25px;
    margin: 0;

    &::after {
      background-color: #ff8486;
    }
  }

  > p {
    color: ${whiteColor};
    font-size: 14px;
    font-weight: 500;
    margin: 0;
    white-space: nowrap;
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
  position: absolute;
  right: ${({ page }) => {
    switch (page) {
      case 'governance':
      case 'council':
      case 'financial requests':
      case 'break glass':
      case 'emergency governance':
      case 'proposal submission':
        return '10px'
      default:
        return '0'
    }
  }};
  width: ${({ page }) => {
    switch (page) {
      case 'governance':
      case 'council':
      case 'financial requests':
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
        return '172px'
      case 'break glass':
      case 'emergency governance':
        return '130px'
      case 'governance':
      case 'council':
      case 'financial requests':
      case 'proposal submission':
        return '158px'
      case 'satellite-governance':
        return '192px'
      case 'data-feeds':
        return '190px'
      default:
        return '172px'
    }
  }};
  bottom: ${({ page }) => {
    switch (page) {
      case 'satellites':
        return '-20px'
      case 'governance':
      case 'council':
      case 'financial requests':
      case 'proposal submission':
        return '7px'
      case 'emergency governance':
        return '-2px'
      default:
        return '0'
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
