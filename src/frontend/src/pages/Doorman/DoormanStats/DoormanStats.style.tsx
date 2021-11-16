import styled from 'styled-components/macro'
import { backgroundColor, primaryColor, subTextColor } from 'styles'

export const DoormanStatsStyled = styled.div`
  margin-top: 30px;
  background-color: ${backgroundColor};
  border-radius: 10px;
  padding: 35px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: ${subTextColor};
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
