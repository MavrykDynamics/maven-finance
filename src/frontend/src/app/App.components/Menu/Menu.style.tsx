import styled, { css } from 'styled-components/macro'
import { backgroundTextColor, primaryColor, subTextColor, textColor } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const MenuStyled = styled.div`
  position: relative;
  text-align: center;
  width: 270px;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-image: url('/images/menu-bg.svg');
  background-position: top left;
  background-repeat: no-repeat;
`

export const MenuLogo = styled.img`
  margin: 17px auto 25px auto;
  z-index: 1;
  width: 175px;
`

export const MenuGrid = styled.div`
  //display: grid;
  //grid-template-columns: 50px 50px;
  //grid-gap: 20px 60px;
  display: flex;
  align-items: start;
  flex-direction: column;
  justify-content: space-evenly;
  width: 100%;
`

export const MenuBanner = styled.img`
  margin: 0 auto;
`

export const MenuFooter = styled.div`
  margin: 0 auto;
  font-size: 11px;
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
