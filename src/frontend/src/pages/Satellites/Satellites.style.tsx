import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'
import SatelliteList from './SatelliteList/SatellitesList.controller'

export const SatellitesStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
`
export const InfoBlockWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
`

export const SatelliteListStyled = styled(SatelliteList)`
  .feed {
    padding: 16px 25px;
  }
`
