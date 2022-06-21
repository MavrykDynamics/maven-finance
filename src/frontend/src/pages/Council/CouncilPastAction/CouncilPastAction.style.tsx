import styled from 'styled-components/macro'
import { Card, downColor, upColor, skyColor, headerColor, cyanColor } from 'styles'

export const CouncilPastActionStyled = styled(Card)`
  margin: 0;
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: 160px 220px auto 70px;
  align-items: center;
  padding-top: 17px;
  padding-block: 17px;

  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: ${skyColor};
    margin-top: 0;
    margin-bottom: 4px;
  }

  h4 {
    font-weight: 700;
    font-size: 14px;
    line-height: 14px;
    color: ${cyanColor};
  }

  figure {
    margin: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    svg {
      fill: none;
      stroke: ${headerColor};
      width: 16px;
      height: 16px;
    }
  }
`
