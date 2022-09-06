import styled from 'styled-components/macro'
import { backdropColor, cyanColor } from 'styles/colors'
import { MENU_Z_INDEX, Z_INDEX_DEFAULT } from 'styles/constants'

import { MavrykTheme } from '../../../styles/interfaces'

export const MenuSidebarStyled = styled.div<{ theme: MavrykTheme }>`
  max-width: 232px;
  width: 100vw;
  transition: 0.6s all;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    display: none;
  }

  .mobile-logo {
    display: none;
  }

  > div {
    transition: 0.6s all;
    width: 100%;
    max-width: 232px;
    height: fit-content;
  }

  @media screen and (max-width: 1535px) {
    &:not(.menu-expanded) {
      max-width: 72px;

      a .navLinkSubTitle,
      a .navLinkTitle {
        display: none !important;
      }
    }

    &.menu-expanded {
      max-width: 100vw;
      display: flex;
      align-items: flex-start;
    }
  }

  @media screen and (max-width: 1400px) {
    top: 0;
    left: 0;
    z-index: ${MENU_Z_INDEX};
    transition: all 0.3s;

    &.menu-expanded {
      max-width: 100vw;
      display: flex;
      background: ${backdropColor};
      z-index: ${MENU_Z_INDEX};
      align-items: flex-start;

      .menu-backdrop {
        display: block;
      }
    }
  }

  @media screen and (max-width: 450px) {
    &:not(.menu-expanded) {
      max-width: 0;
    }

    &.menu-expanded {
      max-width: 100vw;
    }

    > div {
      width: 100vw;
      max-width: 100vw;
      height: fit-content;
    }
  }
`

export const MenuSidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 232px;
  height: 100%;
  background-color: ${({ theme }) => theme.containerColor};
  padding-top: 80px;
  transition: 0.6s all;
  height: fit-content;
  min-height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`
export const MenuLogo = styled.img`
  z-index: ${Z_INDEX_DEFAULT};
  width: 218px;
  height: 43px;

  &.mobile-logo {
    display: none;
  }

  @media screen and (max-width: 1400px) {
    width: 160px;
  }

  @media screen and (max-width: 950px) {
    &.desktop-logo {
      display: none;
    }

    &.mobile-logo {
      display: block;
      width: fit-content;
    }
  }
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
  padding: 0 14px;

  .social-wrapper {
    display: flex;
    margin-bottom: 10px;
    column-gap: 5px;
    a {
      width: 35px;
      height: 35px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #080628;
      border-radius: 10px;
      svg {
        width: 27px;
        height: 27px;
        fill: ${cyanColor};
      }
    }
  }

  @media screen and (max-width: 1460px) {
    padding: 0 10px;
    font-size: 10px;
  }

  > p {
    display: inline-block;
    font-weight: 500;
  }
`

export const MenuSpacerDiv = styled.div<{ height: number }>`
  height: ${({ height }) => height}px;
`
