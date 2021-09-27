import styled from 'styled-components/macro'
import { backgroundColor, subTextColor, textColor } from 'styles'

export const HeaderStyled = styled.div`
  margin: 0 auto 20px auto;
  position: relative;
  text-align: center;
  height: 80px;
  z-index: 1;
  display: grid;
  grid-template-columns: 170px auto 100px 100px 100px 100px 100px;
  grid-gap: 10px;
  font-weight: 500;
  padding: 0 20px;
  max-width: calc(100vw - 40px);
  width: 1280px;

  > a {
    color: ${subTextColor};
    margin-top: 30px;
  }

  @media (max-width: 1000px) {
    padding: 0 10px;
    max-width: calc(100vw - 20px);
    grid-template-columns: 170px auto 100px;

    a:nth-child(4),
    a:nth-child(5),
    a:nth-child(6),
    a:nth-child(7) {
      display: none;
    }
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
