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
    width: 750px;

    & > h1 {
      margin-bottom: 11px;
    }

    .pending {
      display: flex;
      width: 100%;
      justify-content: space-between;
      margin-bottom: 30px;
    }

    .pending-items {
      width: 750px;
    }
  }

  .right-block {
    width: 310px;

    & > h1 {
      margin-top: 53px;
      margin-bottom: 10px;
    }
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