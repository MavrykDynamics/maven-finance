import styled from 'styled-components/macro'
import { Card, skyColor, headerColor, containerColor, cyanColor } from 'styles'

// types
import { MavrykTheme } from 'styles/interfaces'

export const CouncilPendingStyled = styled(Card)<{ theme: MavrykTheme }>`
  position: relative;
  margin: 0;
  height: 200px;
  padding: 25px;
  padding-bottom: 28px;
  min-width: 237px;

  .number {
    position: absolute;
    right: 20px;
    top: 15px;

    font-weight: 700;
    font-size: 14px;
    line-height: 21px;

    color: ${({ theme }) => theme.cardBorderColor};
  }

  // 2/3
  &.addVestee,
  &.addCouncilMember,
  &.updateVestee,
  &.requestMint {
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

  // 3/3
  &.requestTokens,
  &.transfer {
    min-width: 750px;
    .parameters {
      display: grid;
      grid-template-columns: 130px 144px 150px 186px;
      align-items: center;
    }
  }
  // 3/3
  &.changeCouncilMember {
    min-width: 750px;
    .parameters {
      display: grid;
      grid-template-columns: 180px 180px 100px 186px;
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
      /* white-space: nowrap; */
      /* overflow: hidden; */
      word-break: break-all;
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
  justify-content: center;

  .review-btn:first-of-type {
    margin-bottom: 20px;
  }
`
