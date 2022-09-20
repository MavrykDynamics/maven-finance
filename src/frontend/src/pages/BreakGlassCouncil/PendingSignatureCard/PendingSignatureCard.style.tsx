import styled from "styled-components/macro"
import { Card, skyColor, cyanColor, textsColor, headerColor } from "styles"

import { MavrykTheme } from "../../../styles/interfaces";

export const PendingSignatureCardStyled = styled(Card)<{ theme: MavrykTheme }>`
  padding: 25px 25px 30px 25px;
  margin: 0;
  width: 237px;
  height: 201px;

  h2 {
    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
    color: ${headerColor}
  }

  button {
    &.stroke-03 {
      svg {
        stroke-width: 0.3;
        fill: ${textsColor};
      }
    }
  }

  .content {
    display: flex;
    justify-content: space-between;
    padding: 20px 5px;
  }

  .content-name {
    margin-bottom: 10px;
    font-weight: 400;
    font-size: 12px;
    line-height: 12px;
    color: ${skyColor}
  }

  .content-value {
    font-weight: 600;
    font-size: 16px;
    line-height: 16px;
    color: ${cyanColor}
  }
`
