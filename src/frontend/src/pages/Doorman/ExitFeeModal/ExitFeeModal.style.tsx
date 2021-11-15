import styled from 'styled-components/macro'
import { primaryColor, subTextColor } from 'styles'

export const ExitFeeModalContent = styled.div`
  padding: 0 20px 20px 20px;
`

export const ExitFeeModalButtons = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 10px;
`

export const ExitFeeModalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
  font-weight: 500;
  margin: auto;
  text-align: center;

  > div {
    color: ${subTextColor};
  }

  > p {
    color: ${primaryColor};
    margin-top: 0;
  }
`

export const ExitFeeModalFee = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin: 50px auto;
  text-align: center;

  > div {
    color: ${subTextColor};
  }

  > p {
    color: ${primaryColor};
  }
`
