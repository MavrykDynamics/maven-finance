import styled from 'styled-components/macro'
import { containerColor, upColor, downColor, Card } from 'styles'

export const BecomeSatelliteStyled = styled.div`
  background-color: ${containerColor};
`

export const BecomeSatelliteForm = styled(Card)`
  padding-bottom: 80px;

  > p {
    margin-top: 30px;
  }

  > button {
    width: 300px;
    float: right;
  }
`

export const BecomeSatelliteFormBalanceCheck = styled.div<{ balanceOk: boolean }>`
  color: ${(props) => (props.balanceOk ? upColor : downColor)};
`

export const UploaderFileSelector = styled.div`
  margin: 15px 0;
  cursor: pointer;

  > input {
    width: 86px;
  }
`

export const BecomeSatelliteProfilePic = styled.div``
