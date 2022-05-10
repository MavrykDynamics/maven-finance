import styled, { keyframes } from 'styled-components/macro'

import { MavrykTheme } from '../../../styles/interfaces'

export const moveDown = keyframes`
  from {
    transform: translateY(-5rem);
  }
  to {
    transform: translateY(0rem);
  }
`
export const MenuStyled = styled.div<{ theme: MavrykTheme }>`
  position: relative;
  text-align: center;
  width: 270px;
  min-height: 100vh;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.containerColor};
  > div {
    width: 100%;
    max-width: 270px;
  }
`

export const MenuTopSection = styled.div`
  display: flex;
  flex-direction: column;
  top: 0;
  left: 0;
  z-index: 1;
  justify-content: space-between;
`
export const MenuLogo = styled.img`
  margin: 44px auto 20px auto;
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
`

export const MenuBottomSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  margin-top: 40px;
`

export const MenuBanner = styled.img`
  margin: 0 auto 15px auto;
`

export const MenuFooter = styled.div<{ theme: MavrykTheme }>`
  margin: 15px auto 15px auto;
  font-size: 11px;
  color: ${({ theme }) => theme.footerColor};
  font-weight: 600;

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
