import styled from 'styled-components/macro'
import { Card, cyanColor, downColor, upColor, skyColor, headerColor, royalPurpleColor } from 'styles'

export const CouncilMemberStyled = styled(Card)`
  margin: 0;
  display: flex;
  align-items: center;
  padding: 12px 28px;
  margin-bottom: 9px;

  figcaption {
    width: calc(100% - 70px);

    h4 {
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 700;
      font-size: 14px;
      line-height: 14px;
      color: ${cyanColor};
      margin-bottom: 3px;
    }

    div {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      color: ${headerColor};
    }
  }

  figure {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
    margin-right: 20px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
  }
`
