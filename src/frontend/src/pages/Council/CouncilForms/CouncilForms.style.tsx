import styled from 'styled-components/macro'
import { Card, downColor, upColor, skyColor, headerColor, cyanColor, royalPurpleColor, containerColor } from 'styles'

export const CouncilFormStyled = styled.form`
  padding: 24px 30px;
  border-top: 1px solid ${royalPurpleColor};
  margin-top: 1px;
  position: relative;

  .form-h1 {
    margin-top: 15px;
    margin-bottom: 0;
  }

  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: ${skyColor};
    margin-bottom: 16px;
    margin-top: 1px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding-top: 1px;
    row-gap: 18px;

    &.form-grid-button-right {
      padding-bottom: 16px;
    }

    .form-grid-adress {
      color: ${upColor};
      padding-top: 12px;
      padding-left: 16px;
    }
  }

  label {
    font-weight: 700;
    font-size: 14px;
    line-height: 21px;
    color: ${headerColor};
    padding-left: 8px;
    padding-bottom: 5px;
    display: block;
  }

  .form-ipfs {
    margin-bottom: 0;

    label {
      margin-bottom: 2px;
    }
  }

  .btn-group {
    display: flex;
    justify-content: flex-end;
    padding-top: 40px;
    padding-bottom: 15px;
  }

  .plus-btn {
    width: 250px;

    svg {
      stroke: none;
    }

    &.fill {
      svg {
        stroke: ${containerColor};
      }
    }
  }

  .button-aligment {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    margin-bottom: -3px;
  }

  .textarea-group {
    padding-top: 20px;
  }

  .with-pinned-text {
    .pinned-text {
      font-weight: 600;
      font-size: 14px;
      line-height: 14px;
      top: 14px;
    }
  }
`
