import styled from 'styled-components/macro'
import { backgroundColor, containerColor, primaryColor, subTextColor } from 'styles'

export const SatelliteListStyled = styled.div`
  background-color: ${containerColor};
`

export const SatelliteListEmptyContainer = styled.div`
  background-color: ${backgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  margin-top: 30px;
  border-radius: 10px;
  color: ${primaryColor};
  font-size: 18px;
  font-weight: 800;
  max-height: 100px;
`
export const SatelliteSearchFilter = styled.div`
  background-color: ${backgroundColor};
  display: flex;
  align-items: baseline;
  padding: 10px;
  margin-top: 30px;
  border-radius: 10px;
  color: ${subTextColor};

  > * {
    flex: 1;
    margin: 5px;
  }
  > :nth-child(1) {
    flex: 3;
  }
  > :nth-child(2) {
    min-width: max-content;
    flex: 1;
  }
`
export const SelectContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`
