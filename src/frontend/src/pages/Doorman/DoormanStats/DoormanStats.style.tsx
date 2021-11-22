import styled from 'styled-components/macro'
import { Card, primaryColor, subTextColor } from 'styles'

export const DoormanStatsStyled = styled(Card)`
  text-align: center;
`

export const DoormanStatsGrid = styled.div`
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
