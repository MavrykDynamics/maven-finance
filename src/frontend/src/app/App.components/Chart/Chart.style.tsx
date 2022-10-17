import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const ChartTooltip = styled.div<{ theme: MavrykTheme }>`
  padding: 6px 10px;
  text-align: center;

  font-weight: 600;
  font-size: 15px;
  line-height: 15px;

  color: ${({ theme }) => theme.secondaryColor};
  background: ${({ theme }) => theme.containerColor};
  border: 1px solid ${({ theme }) => theme.secondaryColor};
  border-radius: 10px;

  div {
    font-weight: 500;
    font-size: 9px;
    line-height: 18px;
    color: ${({ theme }) => theme.headerColor};
  }
`
