import styled from "styled-components/macro";
import { skyColor, headerColor, textsColor } from "styles";

export const BreakGlassActionsFormsWrapper = styled.div`
  .form {
    padding: 40px 20px;

    h1, p, label {
      padding-left: 10px;
    }
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

    &.start_verification {
      svg {
        stroke-width: 0.1;
        fill: ${textsColor};
      }
    }
  }
`