import styled from "styled-components/macro";
import { skyColor, headerColor, textsColor } from "styles";

export const FormStyled = styled.div`
  position: relative;
  padding: 40px 20px;

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

  .form {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .form-fields {
    label {
      display: block;
      padding-bottom: 6px;
      font-weight: 700;
      font-size: 14px;
      line-height: 21px;

      color: ${headerColor};
    }
  }

  .form-ipfs {
    margin: 0;
    margin-bottom: 40px;

    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 700;
      font-size: 14px;
      line-height: 21px;

      color: ${headerColor};
    }
  }

  .input-size-primary {
    width: 400px;
  }

  .input-size-secondary {
    width: 330px;
  }

  .input-size-tertiary {
    width: 360px;
  }

  .in-two-columns {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .margin-bottom-20 {
    margin-bottom: 20px;
  }

  .align-to-right {
    display: flex;
    justify-content: flex-end;
  }
`