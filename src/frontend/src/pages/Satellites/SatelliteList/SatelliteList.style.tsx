import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const SatelliteListStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
`

export const SatelliteListEmptyContainer = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  margin-top: 30px;
  border-radius: 10px;
  color: ${({ theme }) => theme.primaryColor};
  font-size: 18px;
  font-weight: 800;
  max-height: 100px;
`
export const SatelliteSearchFilter = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  display: flex;
  align-items: center;
  padding: 0 10px;
  margin-top: 30px;
  border-radius: 10px;
  color: ${({ theme }) => theme.subTextColor};

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
