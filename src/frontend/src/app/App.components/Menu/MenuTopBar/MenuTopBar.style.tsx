import styled from 'styled-components/macro'
import { cyanColor } from 'styles/colors'

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
    margin: 0 auto;
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
