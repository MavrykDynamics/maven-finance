import styled from 'styled-components/macro'
import { Card, containerColor, upColor, downColor } from 'styles'

export const BecomeSatelliteStyled = styled.div`
  background-color: ${containerColor};
`

export const BecomeSatelliteForm = styled(Card)``

export const BecomeSatelliteFormBalanceCheck = styled.div<{ balanceOk: boolean }>`
  color: ${(props) => (props.balanceOk ? upColor : downColor)};
`
