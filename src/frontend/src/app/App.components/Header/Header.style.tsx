import styled from 'styled-components/macro'
import { backgroundColor, subTextColor, textColor } from 'styles'

export const HeaderStyled = styled.div`
  margin: 0 auto 20px auto;
  width: 100%;
  max-width: 1240px;
  position: relative;
  text-align: center;
  height: 50px;
  z-index: 1;
  display: grid;
  grid-template-columns: 170px auto 100px 100px 150px;
  grid-gap: 10px;

  > a:nth-child(3),
  a:nth-child(4) {
    color: ${subTextColor};
    margin-top: 21px;
  }
`

export const HeaderLogo = styled.img`
  margin-top: 13px;
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

export const HeaderAccount = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 20px;

  @media (max-width: 1300px) {
    grid-template-columns: auto auto;
    > :nth-child(3) {
      display: none;
    }
  }

  @media (max-width: 1000px) {
    grid-template-columns: auto;
    > :nth-child(1),
    :nth-child(3) {
      display: none;
    }
  }
`
