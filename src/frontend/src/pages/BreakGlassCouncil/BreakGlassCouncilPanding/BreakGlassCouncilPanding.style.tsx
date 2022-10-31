import styled from 'styled-components/macro'
import { Card, skyColor, headerColor, containerColor, cyanColor } from 'styles'

export const CouncilPendingStyled = styled(Card)`
  margin: 0;
  height: 200px;
  padding: 25px;
  min-width: 237px;

  &.setSingleContractAdmin,
  &.updateCouncilMember,
  &.changeCouncilMember,
  &.addCouncilMember {
    h3 {
      max-width: 100%;
    }
  }

  &.addCouncilMember {
    min-width: 490px;

    .parameters {
      display: grid;
      grid-template-columns: 150px 185px;

      article {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
    }
  }

  &.setSingleContractAdmin {
    min-width: 380px;

    .parameters {
      display: grid;
      grid-template-columns: 125px 185px;
      align-items: center;
    }
  }

  &.updateCouncilMember {
    min-width: 532px;

    .parameters {
      display: grid;
      grid-template-columns: 118px 144px 185px;
      align-items: center;
    }
  }

  &.changeCouncilMember {
    min-width: 725px;

    .parameters {
      display: grid;
      grid-template-columns: 125px 160px 155px 185px;
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

  .parameters-link {
    display: block;

    color: ${cyanColor};
    font-weight: 700;
    font-size: 14px;
    line-height: 14px;

    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .parameters {
    display: flex;
    justify-content: space-between;
    gap: 16px;

    &:first-of-type {
      padding-bottom: 20px;
    }

    .parameters-value,
    .parameters-value p {
      margin: 0;
      color: ${cyanColor};
      font-weight: 600;
      font-size: 16px;
      line-height: 16px;
      white-space: nowrap;
      overflow: hidden;
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

    .without-margin {
      margin: 0;
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
