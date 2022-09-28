import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card, CardHeader } from 'styles'

export const ChartStyled = styled(Card)<{ theme: MavrykTheme }>`
  padding: 30px 20px 20px;
  height: auto;

  aside {
    display: flex;
    color: ${({ theme }) => theme.headerSkyColor};
    text-align: center;
    align-items: center;
    height: 100%;

    justify-content: center;
    font-size: 22px;
    padding-bottom: 24px;
  }
`

export const ChartHeader = styled(CardHeader)<{ theme: MavrykTheme }>`
  margin-bottom: 25px;
  text-align: center;
`

export const ChartTooltip = styled.div`
  padding: 6px 10px;
  text-align: center;

  font-weight: 600;
  font-size: 15px;
  line-height: 15px;

  color: #86d4c9;
  background: #160e3f;
  border: 1px solid #86d4c9;
  border-radius: 10px;

  div {
    font-weight: 500;
    font-size: 9px;
    line-height: 18px;
    color: #8D86EB;
  }
`
