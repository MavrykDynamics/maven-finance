import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const ExitFeeModalContent = styled.div`
  padding: 0 20px 20px 20px;
`

export const ExitFeeModalButtons = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 10px;
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
