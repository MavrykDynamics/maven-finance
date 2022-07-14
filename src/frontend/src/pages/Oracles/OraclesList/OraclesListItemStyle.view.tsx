import styled, { css } from 'styled-components/macro'
import { Card, cyanColor, skyColor, royalPurpleColor, headerColor, boxShadowColor } from 'styles'

export const OracleItemStyle = styled(Card)`
  margin-top: 0;
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 16px 40px;

  .item {
    h5 {
      color: ${headerColor};
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      margin-top: 0;
      margin-bottom: 6px;
    }

    var {
      font-style: normal;
      color: ${cyanColor};
      font-weight: 700;
      font-size: 14px;
      line-height: 14px;
    }
  }
`
