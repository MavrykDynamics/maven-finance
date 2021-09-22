import styled from 'styled-components/macro'
import { backgroundColor, subTextColor, textColor } from 'styles'

export const HeaderStyled = styled.div`
  margin: 0 auto 20px auto;
  width: 100%;
  max-width: 1240px;
  position: relative;
  text-align: center;
  height: 80px;
  z-index: 1;
  display: grid;
  grid-template-columns: 170px auto 100px 100px 100px 100px 100px;
  grid-gap: 10px;
  font-weight: 500;

  > a {
    color: ${subTextColor};
    margin-top: 30px;
  }
`

export const HeaderLogo = styled.img`
  margin-top: -10px;
  z-index: 1;
  width: 170px;
`

export const HeaderButton = styled.div`
  cursor: pointer;
  background: ${textColor};
  border-radius: 5px;
  padding: 10px;
  color: ${backgroundColor};
  text-align: center;
  font-weight: bold;
  margin-top: 10px;
`
