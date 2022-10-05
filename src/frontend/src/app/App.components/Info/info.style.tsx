import styled from 'styled-components/macro'
import { headerColor, darkPurpleColor, royalPurpleColor, downColor, dangerColor } from 'styles'

export const InfoBlock = styled.blockquote`
  display: flex;
  align-items: center;
  background-color: ${darkPurpleColor};
  border: 1px solid ${royalPurpleColor};
  border-radius: 10px;
  margin: 0;
  padding: 8px 20px;
  justify-content: space-between;

  svg {
    stroke: ${headerColor};
    height: 16px;
    width: 16px;
    margin-right: 19px;
    flex-shrink: 0;
  }

  p {
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    margin: 0;
    color: ${headerColor};
  }

  &.error {
    border-color: ${dangerColor};
    min-height: 100px;
    padding: 20px 40px;

    p {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
    }

    svg {
      stroke: ${downColor};
      stroke-width: 2;
      margin-right: 0;
    }
  }

  &.warning {
    border-color: ${downColor};
    min-height: 64px;
    padding: 20px 30px;

    p {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      width: 100%;
      padding-left: 20px;
    }

    svg {
      stroke: ${downColor};
      stroke-width: 2;
      margin-right: 0;
      width: 24px;
      height: 24px;
    }
  }

  &.no-edit-info {
    margin-top: 20px;
  }

  &.indent-bottom {
    margin-bottom: 20px;

    &.warning {
      svg {
        stroke: none;
        stroke-width: 0.3;
        fill: ${downColor};
      }
    }
  }
`
