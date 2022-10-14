import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card } from 'styles'

export const ChartCard = styled(Card)<{ theme: MavrykTheme }>`
  padding: 30px 12px 14px 40px;
`

export const ChartSlidingTabButtons = styled.div`
  display: flex;
  width: 394px;
  height: 40px;

  > div {
    width: 100%;
    justify-content: flex-end;
  }

  div {
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
  }

  button {
    width: 100%;
  }
`
