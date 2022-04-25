import styled from 'styled-components/macro'
import { Card } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const DoormanStatsStyled = styled(Card)`
  text-align: center;
`

export const DoormanStatsGrid = styled.div<{ theme: MavrykTheme }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
  font-weight: 500;
  margin: auto;
  text-align: center;

  > div {
    color: ${({ theme }) => theme.subTextColor};
    > p {
      color: ${({ theme }) => theme.primaryColor};
      margin-top: 0;
    }
  }
`
