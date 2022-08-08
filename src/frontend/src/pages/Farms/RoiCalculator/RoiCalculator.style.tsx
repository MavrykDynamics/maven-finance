import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card, skyColor, cyanColor, headerColor, royalPurpleColor } from 'styles'

export const RoiCalculatorStyled = styled.section`
  header {
    display: flex;
    align-items: center;

    h2 {
      color: ${cyanColor};
      font-weight: 600;
      font-size: 18px;
      line-height: 18px;
      padding-left: 18px;
    }
  }
`
