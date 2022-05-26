import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

import { Card } from 'styles'

export const TreasuryViewStyle = styled(Card)`
  display: grid;
  grid-template-columns: auto 254px 184px;
  gap: 50px;

  .assets-block {
    display: grid;
    grid-template-columns: 100px 150px auto;
    gap: 30px;
  }

  .right-text {
    text-align: right;
  }
` //TreasuryViewStyle
