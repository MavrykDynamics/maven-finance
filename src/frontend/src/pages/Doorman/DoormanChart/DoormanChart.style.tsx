import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card } from 'styles'

export const ChartCard = styled(Card)<{ theme: MavrykTheme }>`
padding: 30px 20px 20px;
`

export const ChartSlidingTabButtons = styled.div`
display: flex;
width: 300px;
height: 40px;

> div {
  width: 100%;
  justify-content: flex-end;
}

button {
  width: 100%;
  font-weight: 600;
  font-size: 14px;
  line-height: 14px;
}
`
