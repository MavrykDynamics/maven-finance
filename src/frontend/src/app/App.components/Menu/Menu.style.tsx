import styled, { keyframes } from 'styled-components/macro'
import { backdropColor, cyanColor, royalPurpleColor } from 'styles/colors'

import { MavrykTheme } from '../../../styles/interfaces'

export const moveDown = keyframes`
  from {
    transform: translateY(-5rem);
  }
  to {
    transform: translateY(0rem);
  }
`

export const MenuTopStyled = styled.div<{ theme: MavrykTheme }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  z-index: 35;
  background: #160e3f;
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  padding: 0 22px 0 34px;

  #connectWalletButton {
    margin: 0;
  }

  .left-side,
  .right-side {
    display: flex;
    align-items: center;
  }

  .right-side {
    margin-left: auto;
    .settingsIcon {
      margin-left: 25px;
      cursor: pointer;
      transition: 0.35s all;

      svg {
        width: 28px;
        height: 28px;
        transition: 0.35s all;
      }

      &:hover {
        svg {
          stroke: ${cyanColor};
        }
      }
    }

    .social-wrapper {
      display: flex;
      column-gap: 8px;
      margin-right: 20px;

      svg {
        width: 30px;
        height: 30px;
      }
    }
  }

  .grouped-links {
    margin-left: 30px;
    height: 100%;
    display: flex;
    align-items: center;
  }

  // in case we need a mobile logo
  /* 
  .mobile-logo {
    display: none;
  }

  @media screen and (max-width: 1460px) {
  .desctop-logo,
    a .navLinkSubTitle,
    a .navLinkTitle {
      display: none !important;
  }

  .mobile-logo {
    display: block;
    width: 50px;
    margin: 27px auto;
    height: fit-content;
  } 
  */
`

export const MenuStyled = styled.div<{ theme: MavrykTheme }>`
  width: 270px;
  transition: all 0.3s;
  min-height: 100vh;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 30;

  .mobile-logo {
    display: none;
  }

  @media screen and (max-width: 1460px) {
    &:not(.menu-expanded) {
      width: 72px;

      a .navLinkSubTitle,
      a .navLinkTitle {
        display: none !important;
      }
    }

    &.menu-expanded {
      width: 100vw;
      display: flex;
      display: flex;
      background: ${backdropColor};
      z-index: 30;
      align-items: flex-start;

      .menu-backdrop {
        display: block;
      }
    }
  }

  > div {
    width: 100%;
    max-width: 270px;
  }

  &.menu-collapsed {
    width: 72px;

    a .navLinkSubTitle,
    a .navLinkTitle {
      display: none !important;
    }
  }
`

export const MenuMobileBurger = styled.div<{ theme: MavrykTheme }>`
  display: block;
  width: fit-content;
  margin: 0 auto;
  transition: all 1s cubic-bezier(0.42, 0, 0.58, 1);
  align-items: center;
  cursor: pointer;
  margin-right: 24px;

  &.expanded {
    transform: rotate(-540deg);
  }

  svg {
    width: 30px;
    height: 30px;
  }
`

export const MenuTopSection = styled.div`
  display: flex;
  flex-direction: column;
  top: 0;
  left: 0;
  z-index: 10;
  text-align: center;
  width: 100%;
  max-width: 270px;
  min-height: 100vh;
  height: 100%;
  background-color: ${({ theme }) => theme.containerColor};
  position: relative;
  padding-top: 110px;
`
export const MenuLogo = styled.img`
  z-index: 1;
  width: 218px;
  height: 43px;
`

export const MenuGrid = styled.div`
  display: flex;
  align-items: start;
  flex-direction: column;
  justify-content: space-evenly;
  width: 100%;
  margin-bottom: 50px;
`

export const MenuFooter = styled.div<{ theme: MavrykTheme }>`
  font-size: 11px;
  color: ${({ theme }) => theme.footerColor};
  font-weight: 600;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);

  @media screen and (max-width: 1460px) {
    padding: 0 10px;
    font-size: 10px;
  }

  > p {
    display: inline-block;
    font-weight: 500;
  }
`

export const ThemeToggleIcon = styled.svg`
  width: inherit;
  height: inherit;
`

export const MenuSpacerDiv = styled.div<{ height: number }>`
  height: ${({ height }) => height}px;
`
