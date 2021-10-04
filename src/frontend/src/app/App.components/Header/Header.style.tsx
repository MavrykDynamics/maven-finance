import styled from 'styled-components/macro'
import { backgroundColor, subTextColor, textColor } from 'styles'

export const HeaderStyled = styled.div<{ showBg: boolean }>`
  width: 100%;
  position: fixed;
  top: 0;
  z-index: 1;

  background-color: ${(props) => (props.showBg ? '#FFFFFFFF' : '#FFFFFF00')};
  will-change: background-color;
  transition: background-color 200ms ease-in-out;
`

export const HeaderGrid = styled.div`
  margin: 0 auto;
  max-width: calc(100vw - 40px);
  width: 1280px;

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
    margin-top: 33px;
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
  margin-top: -16px;
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
