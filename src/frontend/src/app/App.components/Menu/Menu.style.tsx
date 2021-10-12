import styled, { css } from 'styled-components/macro'
import { backgroundTextColor, primaryColor, subTextColor, textColor } from 'styles'

export const MenuStyled = styled.div`
  position: relative;
  text-align: center;
  height: 100vh;
  width: 270px;
  padding: 0 20px;

  background-image: url('/images/menu-bg.svg');
  background-position: top left;
  background-repeat: no-repeat;
`

export const MenuLogo = styled.img`
  margin: 17px auto 25px auto;
  z-index: 1;
  width: 175px;
`

export const MenuButton = styled.div`
  margin: 0 auto 25px auto;
  width: 160px;
  height: 50px;
  cursor: pointer;
  background: ${backgroundTextColor};
  border-radius: 10px;
  color: ${subTextColor};
  text-align: center;
  font-weight: bold;
  line-height: 50px;
  font-size: 12px;

  > svg {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin: 14px 9px 13px 8px;
    stroke: ${subTextColor};
    vertical-align: top;
  }

  > div {
    display: inline-block;
    margin-right: 9px;
    font-weight: 600;
  }
`

export const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: 50px 50px;
  grid-gap: 20px 60px;
  width: 160px;
  margin: auto;
`

export const MenuIcon = styled.div<{ selected: boolean }>`
  margin: 0 auto 25px auto;
  width: 50px;
  height: 50px;
  cursor: pointer;
  background: ${backgroundTextColor};
  border-radius: 10px;
  color: ${subTextColor};
  text-align: center;
  font-weight: bold;
  line-height: 50px;

  > div {
    font-size: 11px;
    line-height: 31px;
    font-weight: 600;
    color: ${subTextColor};
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  > svg {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin: 14px 9px 13px 8px;
    stroke: ${subTextColor};
    vertical-align: top;
  }

  ${(props) =>
    props.selected &&
    css`
      background: ${primaryColor};
      color: ${backgroundTextColor};
      box-shadow: 2px 4px 4px rgba(112, 104, 170, 0.3);

      > div {
        color: ${textColor};
      }

      > svg {
        stroke: ${backgroundTextColor};
      }
    `}
`

export const MenuConnected = styled.div`
  text-align: center;
  font-weight: 600;
  margin: 10px auto 33px auto;

  > p {
    font-size: 11px;
    line-height: 11px;
    margin: 3px;
    color: ${textColor};
  }

  > div {
    font-size: 18px;
    line-height: 18px;
    color: ${primaryColor};
  }
`

export const MenuBanner = styled.img`
  margin: 40px auto 0 auto;
`

export const MenuFooter = styled.div`
  margin: 60px auto 0 auto;
  font-size: 11px;
  font-weight: 600;

  > p {
    display: inline-block;
    font-weight: 500;
  }
`
