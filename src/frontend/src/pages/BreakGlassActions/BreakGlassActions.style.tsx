import styled from "styled-components/macro";
import { Card, skyColor, cyanColor } from "styles";

import { MavrykTheme } from "../../styles/interfaces";

export const BreakGlassActionsCard = styled(Card)<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 75px;
  
  h1 {
    margin: 0;

    &::after{
      display: none;
    }
  }

  button {
    max-width: 250px;
  }
`
