import styled from 'styled-components/macro'
import { backgroundTextColor, subTextColor } from 'styles'

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

  > svg {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin: 3px;
    margin-top: 10px;
    stroke: ${subTextColor};
    vertical-align: top;
    margin-top: 12px;
    margin-right: 8px;
  }
`
