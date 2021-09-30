import styled from 'styled-components/macro'
import { backgroundColor, textColor } from 'styles'

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
  cursor: pointer;
  background: ${textColor};
  border-radius: 5px;
  padding: 10px;
  color: ${backgroundColor};
  text-align: center;
  font-weight: bold;
  margin-top: 10px;
`
