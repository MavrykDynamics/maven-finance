import styled from 'styled-components/macro'
import { Card, downColor, upColor, skyColor, headerColor, cyanColor, royalPurpleColor } from 'styles'

export const CouncilFormStyled = styled.form`
  padding: 24px 30px;
  border-top: 1px solid ${royalPurpleColor};
  margin-top: 1px;

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

    label {
      font-weight: 700;
      font-size: 14px;
      line-height: 21px;
      color: ${headerColor};
      padding-left: 8px;
      padding-bottom: 5px;
      display: block;
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
  }
`
