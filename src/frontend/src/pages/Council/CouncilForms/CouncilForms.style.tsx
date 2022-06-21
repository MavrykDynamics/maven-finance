import styled from 'styled-components/macro'
import { Card, downColor, upColor, skyColor, headerColor, cyanColor, royalPurpleColor } from 'styles'

export const CouncilFormStyled = styled.form`
  padding: 24px 30px;
  border-top: 1px solid ${royalPurpleColor};

  h1 {
    margin-top: 0;
    margin-bottom: 0;
  }

  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: ${skyColor};
    margin-bottom: 16px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    label {
      font-weight: 700;
      font-size: 14px;
      line-height: 21px;
      color: ${headerColor};
      padding-left: 8px;
      padding-bottom: 2px;
      display: block;
    }
  }
`
