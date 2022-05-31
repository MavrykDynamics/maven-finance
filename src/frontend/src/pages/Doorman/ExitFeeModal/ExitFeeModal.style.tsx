import styled from 'styled-components/macro'

import { skyColor } from '../../../styles/colors'
import { MavrykTheme } from '../../../styles/interfaces'

export const ExitFeeModalContent = styled.div`
  padding: 0 41px 20px 33px;

  label {
    color: ${skyColor};
    font-size: 12px;
    display: block;
    margin-bottom: 6px;
    margin-left: 6px;
  }

  input {
    margin-bottom: 0;
    height: 50px;
    font-size: 18px;

    & ~ div {
      top: 18px;
    }
  }

  aside div {
    margin: 4px 6px;
    height: auto;

    h4 {
      color: ${skyColor};

      a svg {
        fill: ${skyColor};
      }
    }
  }
`

export const ExitFeeModalButtons = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 10px;
  margin-top: 30px;
  margin-bottom: 10px;
`

export const ExitFeeModalGrid = styled.div<{ theme: MavrykTheme }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
  font-weight: 500;
  margin: auto;
  text-align: center;

  > div {
    color: ${({ theme }) => theme.subTextColor};
  }

  > p {
    color: ${({ theme }) => theme.primaryColor};
    margin-top: 0;
  }
`

export const ExitFeeModalFee = styled.div<{ theme: MavrykTheme }>`
  font-size: 24px;
  font-weight: bold;
  margin: 50px auto;
  text-align: center;

  > div {
    color: ${({ theme }) => theme.subTextColor};
  }

  > p {
    color: ${({ theme }) => theme.primaryColor};
  }
`
