import styled from 'styled-components/macro'
import { Card, downColor, upColor, skyColor, headerColor, royalPurpleColor, containerColor, cyanColor } from 'styles'

export const CouncilPendingStyled = styled(Card)`
  margin: 0;
  width: 100%;
  padding: 25px;
  padding-bottom: 28px;
  min-width: 237px;

  h3 {
    max-width: 190px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
    color: ${headerColor};
    margin-bottom: 20px;

    &::first-letter {
      text-transform: uppercase;
    }
  }

  .sign-btn {
    svg {
      stroke: transparent;
      fill: ${containerColor};
    }
  }

  .parameters {
    display: grid;
    grid-template-columns: 1fr auto;
    padding-bottom: 20px;

    div {
      color: ${cyanColor};
      font-weight: 600;
      font-size: 16px;
      line-height: 16px;
    }

    p {
      font-weight: 400;
      font-size: 12px;
      line-height: 12px;
      color: ${skyColor};
      margin-top: 0;
      margin-bottom: 10px;
    }
  }
`

export const CouncilPendingReviewStyled = styled(Card)`
  margin: 0;
  width: 309px;
  margin-left: 30px;
  padding: 30px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;

  .review-text {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    p {
      text-align: center;
      font-weight: 600;
      font-size: 16px;
      line-height: 16px;
      color: ${skyColor};
      margin-top: 0;
      margin-bottom: 14px;
    }
  }
`
