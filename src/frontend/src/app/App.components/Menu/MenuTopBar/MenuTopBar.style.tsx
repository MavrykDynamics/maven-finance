import styled, { css } from 'styled-components/macro'
import { cyanColor } from 'styles/colors'
import { MENU_Z_INDEX } from 'styles/constants'

import { MavrykTheme } from '../../../../styles/interfaces'

export const MenuTopStyled = styled.div<{ theme: MavrykTheme }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  z-index: 11;
  background: #160e3f;
  display: flex;
  align-items: center;
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
    height: 100%;
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

      @media screen and (max-width: 1300px) {
        display: none;
      }

      svg {
        width: 30px;
        height: 30px;
      }
    }
  }

  .grouped-links {
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .mobile-menu {
    display: none;
    width: 100%;
    height: 100%;
    justify-content: space-between;
    align-items: center;
    > div {
      margin: 0;
    }

    .top-bar-toggler {
      cursor: pointer;
      svg {
        max-width: 26px;
        height: 21px;
        stroke: #8d86eb;
      }
    }
  }

  @media screen and (max-width: 870px) {
    .mobile-menu {
      display: flex;
    }

    .grouped-links,
    .left-side,
    .right-side {
      display: none;
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

  @media screen and (min-width: 1400px) {
    display: none;
  }
`

export const MobileTopBarStyled = styled.div<{ show: boolean }>`
  position: absolute;
  width: 100vw;
  height: calc(100vh - 80px);
  max-height: 0;
  left: 0;
  top: 80px;
  background: #160e3f;
  z-index: ${MENU_Z_INDEX};
  transition: 0.5s all;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;

  #connectWalletButton {
    height: fit-content;
    margin: 20px auto;
    width: fit-content;
    /* button {
      width: 236px;
    } */
  }

  .container {
    max-width: 236px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    row-gap: 25px;
  }

  @media screen and (min-width: 870px) {
    display: none;
  }

  ${({ show }) =>
    show
      ? css`
          max-height: calc(100vh - 80px);
        `
      : ''}
`
