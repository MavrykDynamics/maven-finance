import styled from "styled-components/macro"
import { Card, royalPurpleColor, textsColor, headerColor } from "styles"

import { MavrykTheme } from "../../styles/interfaces";

export const BreakGlassCouncilStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;

  .left-block {
    width: 751px;
  }

  .right-block {
    width: 309px;
  }

  .pending-signature {
    display: flex;
    justify-content: space-between;
  }
`

export const ReviewPastCouncilActionsCard = styled(Card)<{ theme: MavrykTheme }>`
  
`