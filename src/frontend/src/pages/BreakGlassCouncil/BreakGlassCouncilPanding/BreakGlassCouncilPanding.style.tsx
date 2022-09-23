import styled from 'styled-components/macro'
import { Card, skyColor, headerColor, containerColor, cyanColor } from 'styles'

export const BreakGlassCouncilPendingStyled = styled(Card)`
  margin: 0;
  width: 237px;
  height: 200px;
  padding: 25px 25px 30px 25px;
  padding-bottom: 30px;
  min-width: 237px;

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
  }
`
