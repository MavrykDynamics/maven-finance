import styled from "styled-components/macro";
import { Card, royalPurpleColor, skyColor, headerColor } from "styles";

import { MavrykTheme } from "../../styles/interfaces";

export const PropagateBreakGlassCard = styled(Card)<{ theme: MavrykTheme }>`
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

export const BreakGlassActionsCard = styled(Card)<{ theme: MavrykTheme }>`
  padding: 0%;

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 35px;

    height: 75px;

    border-bottom: 1px solid ${royalPurpleColor};
  }

  .top-bar-title {
    margin: 0;

    &::after{
      display: none;
    }
  }

  .main-section {
    padding: 40px 35px;
  }

  .input-size {
    width: 515px;

    label {
      display: block;
      padding-bottom: 6px;
      font-weight: 700;
      font-size: 14px;
      line-height: 21px;

      color: ${headerColor};
    }
  }

  .dropdown-size {
    width: 450px;
  }

  form {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    margin: 0;
  }
  
  p {
    margin-top: 0;
    margin-bottom: 20px;

    font-weight: 400;
    font-size: 14px;
    line-height: 21px;

    color: ${skyColor};
  }

  button {
    max-width: 250px;
  }
`
