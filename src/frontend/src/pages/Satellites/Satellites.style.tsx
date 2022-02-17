import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

export const SatellitesStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
`
