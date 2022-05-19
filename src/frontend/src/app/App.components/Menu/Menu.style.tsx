import styled, { keyframes } from 'styled-components/macro';

import { MavrykTheme } from '../../../styles/interfaces';

import { backdropColor, darkCianColor } from 'styles/colors';

export const moveDown = keyframes`
  from {
    transform: translateY(-5rem);
  }
  to {
    transform: translateY(0rem);
  }
`;
export const MenuStyled = styled.div<{ theme: MavrykTheme }>`
  width: 270px;
  transition: all 0.3s;
  .mobile-logo {
    display: none;
  }

  @media screen and (max-width: 1460px) {
    &:not(.menu-expanded) {
      width: 72px;
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

      #connectWalletButton {
        display: none;
      }
    }

    &.menu-expanded {
      width: 100vw;
      display: flex;
      display: flex;
      background: ${backdropColor};
      z-index: 10;
      align-items: flex-start;
      .burger-menu {
        margin: 21px 29px 0 auto;
        transform: rotate(45deg);
        > div {
          display: none;
        }

        > div:first-child {
          display: block;
          transform: rotate(90deg) translateX(3px);
        }

        > div:last-child {
          display: block;
          transform: translateY(-5px);
        }
      }

      .menu-backdrop {
        display: block;
      }
    }
  }

  > div {
    width: 100%;
    max-width: 270px;
  }
`;

export const MenuMobileBurger = styled.div<{ theme: MavrykTheme }>`
  display: none;
  width: 24px;
  margin: 0 auto;
  margin-top: 21px;
  justify-content: center;
  flex-direction: column;
  transition: all 0.3s;
  align-items: center;
  cursor: pointer;
  @media screen and (max-width: 1460px) {
    display: flex;
  }
  > div {
    width: 100%;
    height: 2px;
    border-radius: 3px;
    background-color: ${darkCianColor};
    margin: 3px 0;
  }
`;

export const MenuTopSection = styled.div`
  display: flex;
  flex-direction: column;
  top: 0;
  left: 0;
  z-index: 10;
  position: relative;
  text-align: center;
  width: 100%;
  max-width: 270px;
  min-height: 100vh;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.containerColor};
`;
export const MenuLogo = styled.img`
  margin: 44px auto 20px auto;
  z-index: 1;
  width: 218px;
  height: 43px;
`;

export const MenuGrid = styled.div`
  display: flex;
  align-items: start;
  flex-direction: column;
  justify-content: space-evenly;
  width: 100%;
`;

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
`;

export const ThemeToggleIcon = styled.svg`
  width: inherit;
  height: inherit;
`;

export const MenuSpacerDiv = styled.div<{ height: number }>`
  height: ${({ height }) => height}px;
`;
