import styled from 'styled-components/macro'
import { containerColor, subTextColor } from 'styles'

export const SatelliteDetailsStyled = styled.div`
  background-color: ${containerColor};
`

export const SatelliteDescriptionText = styled.p`
  font-size: 14px;
  color: ${subTextColor};
  font-weight: ${({ fontWeight }: { fontWeight: number }) => `${fontWeight}`};
  margin: 0;
`
export const SatelliteCardBottomRow = styled.div`
  display: flex;
  flex-direction: column;
  padding: 35px;
  justify-content: center;
`
