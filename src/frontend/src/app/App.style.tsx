import styled from 'styled-components/macro'
import { darkPurpleColor, headerColor, royalPurpleColor } from 'styles'

import { MavrykTheme } from '../styles/interfaces'

export const AppStyled = styled.div<{ theme: MavrykTheme; isExpandedMenu?: boolean }>`
  --carousel-button-size: 30px;
  --carousel-button-bg: rgb(22 14 63 / 70%);
  --carousel-button-indent: -15px;
  min-height: 100vh;
  /* display: grid; */
  padding-left: ${({ isExpandedMenu }) => (isExpandedMenu ? '232px' : '72px')};
  /* grid-template-columns: ${({ isExpandedMenu }) => (isExpandedMenu ? '232px' : '72px')} auto; */

  @media screen and (max-width: 1360px) {
    /* grid-template-columns: ${({ isExpandedMenu }) => (isExpandedMenu ? '232px' : '72px')} auto; */
  }

  @media screen and (max-width: 1260px) {
    padding-left: 72px;
    /* grid-template-columns: 72px auto; */
  }
`

export const LoaderStyled = styled.div<{ theme: MavrykTheme }>`
  position: fixed;
  inset: 0;
  transition: background-color 0.15s ease-in-out;
  background-color: #08062880;
  display: flex;
  z-index: 12;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-weight: 600;
  font-size: 18px;
  color: ${({ theme }) => theme.valueColor};

  figcaption {
    margin-top: -30px;
  }
`
export const AppBg = styled.div<{ theme: MavrykTheme }>`
  position: fixed;
  top: 0;
  left: 0;
  min-width: 100vw;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.containerColor};
  /* background-image: url('/images/bg.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover; */
`

export const AppWrapper = styled.div`
  position: absolute;
  width: 100vw;
  top: 0;
  background: url('/images/grid.svg') repeat center top;
  /* height: 100vh; */
  will-change: transform, opacity;
`

export const EmptyContainer = styled.figure<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  color: ${({ theme }) => theme.headerColor};
  font-size: 18px;
  font-weight: 800;
  flex-direction: column;
  padding-top: 16px;

  & ~ figure {
    display: none;
  }
`
