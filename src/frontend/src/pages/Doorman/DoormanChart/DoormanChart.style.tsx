import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card } from 'styles'

export const Wrapper = styled.div`
  .switcher {
    margin-top: 30px;
    width: 287px;
  }
`

export const ChartCard = styled(Card)<{ theme: MavrykTheme }>`
  margin-top: 20px;
  padding: 30px 20px 15px 20px;
`
