import styled from "styled-components/macro";
import { skyColor, headerColor, textsColor } from "styles";

export const FormStyled = styled.div`
  padding: 40px 20px;

  form {
    display: flex;
    align-items: flex-end;
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

  h1, p, label {
    padding-left: 10px;
  }

  button {
    max-width: 250px;

    &.stroke-01 {
      svg {
        stroke-width: 0.1;
        fill: ${textsColor};
      }
    }

    &.stroke-03 {
      svg {
        stroke-width: 0.3;
        fill: ${textsColor};
      }
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

  .margin-bottom-15 {
    margin-bottom: 15px;
  }
`