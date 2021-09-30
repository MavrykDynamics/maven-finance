import styled from 'styled-components/macro'
import { backgroundColor, textColor } from 'styles'

export const MenuStyled = styled.div`
  position: relative;
  text-align: center;
  height: 100vh;
  width: 270px;

  padding: 20px;
`

export const MenuLogo = styled.img`
  margin-top: 13px;
  z-index: 1;
  width: 170px;
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
