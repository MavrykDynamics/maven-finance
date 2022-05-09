import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card, CardHeader } from 'styles'

export const ChartStyled = styled(Card)<{ theme: MavrykTheme }>`
  h2 {
    text-align: center;
  }

  > div {
    border-right: 2px solid #8d86eb;
    border-bottom: 2px solid #8d86eb;
  }

  .tooltip {
    color: #86d4c9;
    background: #160e3f;
    padding: 2px 18px;
    line-height: 24px;

    border: 1px solid #503eaa;
    border-radius: 15px;
  }
`

export const ChartHeader = styled(CardHeader)<{ theme: MavrykTheme }>`
  text-align: center;
`
