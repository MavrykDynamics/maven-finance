import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card } from 'styles'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

export const ChartCard = styled(Card)<{ theme: MavrykTheme }>`
  padding: 30px 20px 15px 20px;
`

export const ChartSlidingTabButtons = styled(SlidingTabButtons)`
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
