import styled, { keyframes } from 'styled-components/macro'
import { backdropColor, cyanColor } from 'styles/colors'
import { MENU_Z_INDEX, Z_INDEX_DEFAULT } from 'styles/constants'

import { MavrykTheme } from '../../../styles/interfaces'

export const moveDown = keyframes`
  from {
    transform: translateY(-5rem);
  }
  to {
    transform: translateY(0rem);
  }
`

export const MenuSidebarStyled = styled.div<{ theme: MavrykTheme }>`
  width: 232px;
  min-height: 650px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow-x: hidden;

  .mobile-logo {
    display: none;
  }

  @media screen and (max-width: 1535px) {
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
      align-items: flex-start;
    }
  }

  @media screen and (max-width: 1400px) {
    top: 0;
    left: 0;
    z-index: ${MENU_Z_INDEX};
    transition: all 0.3s;

    &.menu-expanded {
      width: 100vw;
      display: flex;
      background: ${backdropColor};
      z-index: ${MENU_Z_INDEX};
      align-items: flex-start;

      .menu-backdrop {
        display: block;
      }
    }
  }

  > div {
    width: 100%;
    max-width: 232px;
  }

  &.menu-collapsed {
    width: 72px;

    a .navLinkSubTitle,
    a .navLinkTitle {
      display: none !important;
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
  min-height: 100vh;
  height: 100%;
  background-color: ${({ theme }) => theme.containerColor};
  padding-top: 110px;
`
export const MenuLogo = styled.img`
  z-index: ${Z_INDEX_DEFAULT};
  width: 218px;
  height: 43px;

  @media screen and (max-width: 1535px) {
    width: 160px;
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
