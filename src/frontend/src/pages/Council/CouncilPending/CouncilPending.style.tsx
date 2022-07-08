import styled from 'styled-components/macro'
import { Card, downColor, upColor, skyColor, headerColor, royalPurpleColor, containerColor, cyanColor } from 'styles'

export const CouncilPendingStyled = styled(Card)`
  margin: 0;
  width: 100%;
  padding: 25px;
  padding-bottom: 28px;
  min-width: 237px;

  &.addVestee,
  &.addCouncilMember {
    min-width: 532px;
    .parameters {
      display: grid;
      grid-template-columns: 130px 144px 150px;
      align-items: center;
    }

    .sign-btn {
      margin-left: -32px;
    }
  }

  &.requestTokens {
    min-width: 750px;
    .parameters {
      display: grid;
      grid-template-columns: 130px 144px 150px 186px;
      align-items: center;
    }
  }

  &.more {
    margin-right: 19px;
  }

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
    width: 185px;

    svg {
      stroke: transparent;
      fill: ${containerColor};
    }
  }

  .parameters-btn {
    color: ${headerColor};
    font-weight: 700;
    font-size: 14px;
    line-height: 14px;
  }

  .parameters {
    display: flex;
    justify-content: space-between;
    padding-bottom: 20px;
    gap: 16px;

    .parameters-value,
    .parameters-value p {
      margin: 0;
      color: ${cyanColor};
      font-weight: 600;
      font-size: 16px;
      line-height: 16px;
      white-space: nowrap;
      overflow: hidden;
      width: 100%;
      max-width: 100%;
      text-overflow: ellipsis;
      display: block;
    }

    p {
      font-weight: 400;
      font-size: 12px;
      line-height: 12px;
      color: ${skyColor};
      margin-top: 0;
      margin-bottom: 10px;
    }

    .signed-article {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }

  .parameters-img {
    figure {
      height: 50px;
      width: 50px;
    }
    img {
      height: 50px;
      width: 50px;
      object-fit: cover;
      border-radius: 50%;
    }
  }
`

export const CouncilPendingReviewStyled = styled(Card)`
  margin: 0;
  width: 100%;
  height: 201px;
  margin-bottom: 32px;
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
