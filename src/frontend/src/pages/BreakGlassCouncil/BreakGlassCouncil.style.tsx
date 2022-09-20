import styled from "styled-components/macro"
import { Page as PageBase, Card, royalPurpleColor, textsColor, headerColor, skyColor } from "styles"

import { MavrykTheme } from "../../styles/interfaces";

export const Page = styled(PageBase)`
  & > h1 {
    margin-bottom: 11px;
  }
`

export const BreakGlassCouncilStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;

  .left-block {
    width: 751px;

    & > h1 {
      margin-bottom: 11px;
    }
  }

  .right-block {
    width: 309px;

    & > h1 {
      margin-top: 53px;
      margin-bottom: 10px;
    }
  }

  .pending-signature {
    display: flex;
    justify-content: space-between;
  }
`

export const ReviewPastCouncilActionsCard = styled(Card)<{ theme: MavrykTheme }>`
  padding: 60px 30px 30px 30px;
  margin: 0;
  height: 201px;

  h2 {
    text-align: center;
    margin-bottom: 42px;
    font-weight: 600;
    font-size: 16px;
    line-height: 16px;
    color: ${skyColor}
  }
`