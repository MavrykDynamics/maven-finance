import styled, { css } from 'styled-components/macro'
import { backgroundTextColor, primaryColor, subTextColor, textColor } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const MenuStyled = styled.div`
  position: relative;
  text-align: center;
  height: 100vh;
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

export const MenuButton = styled.div<{ theme: MavrykTheme }>`
  margin: 0 auto;
  width: 160px;
  height: 50px;
  cursor: pointer;
  background: ${({ theme }) => theme.backgroundTextColor};
  border-radius: 10px;
  color: ${({ theme }) => theme.subTextColor};
  text-align: center;
  font-weight: bold;
  line-height: 50px;
  font-size: 12px;

  > svg {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin: 14px 9px 13px 8px;
    stroke: ${({ theme }) => theme.subTextColor};
    vertical-align: top;
  }

  > div {
    display: inline-block;
    margin-right: 9px;
    font-weight: 600;
  }
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

export const MenuIcon = styled.div<{ selected: boolean; theme: MavrykTheme }>`
  margin: 0 auto 25px auto;
  width: 50px;
  height: 50px;
  cursor: pointer;
  background: ${({ theme }) => theme.backgroundTextColor};
  border-radius: 10px;
  color: ${({ theme }) => theme.subTextColor};
  text-align: center;
  font-weight: bold;
  line-height: 50px;

  > div {
    font-size: 11px;
    line-height: 31px;
    font-weight: 600;
    color: ${({ theme }) => theme.subTextColor};
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  > svg {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin: 14px 9px 13px 8px;
    stroke: ${({ theme }) => theme.subTextColor};
    vertical-align: top;
  }

  ${(props) =>
    props.selected &&
    css`
      background: ${({ theme }) => theme.primaryColor};
      color: ${({ theme }) => theme.backgroundTextColor};
      box-shadow: 2px 4px 4px rgba(112, 104, 170, 0.3);

      > div {
        color: ${({ theme }) => theme.textColor};
      }

      > svg {
        stroke: ${({ theme }) => theme.backgroundTextColor};
      }
    `}
`

export const MenuConnected = styled.div<{ theme: MavrykTheme }>`
  text-align: center;
  font-weight: 600;
  margin: 10px auto 33px auto;

  > p {
    font-size: 11px;
    line-height: 11px;
    margin: 3px;
    color: ${({ theme }) => theme.textColor};
  }

  > div {
    font-size: 18px;
    line-height: 18px;
    color: ${({ theme }) => theme.primaryColor};
  }

  svg {
    cursor: pointer;
    height: 12px;
    margin-left: 10px;
    width: 20px;
    vertical-align: bottom;
    stroke: ${({ theme }) => theme.primaryColor};
  }
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
