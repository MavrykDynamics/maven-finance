import styled from 'styled-components/macro'
import { Card, CardHeader } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'

export const DoormanStatsStyled = styled(Card)`
  display: flex;
  flex-direction: column;
`

export const DoormanStatsHeader = styled(CardHeader)<{ theme: MavrykTheme }>`
  text-align: center;
`

export const DoormanStatsGrid = styled.div<{ theme: MavrykTheme }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
  font-weight: 500;
  margin: auto;
  text-align: center;

  > div {
    color: ${({ theme }) => theme.subTextColor};
    > p {
      color: ${({ theme }) => theme.primaryColor};
      margin-top: 0;
    }
  }
`

export const DoormanList = styled.div<{ theme: MavrykTheme }>`
  margin-top: auto;

  > div {
    display: flex;
    justify-content: space-between;
    padding-top: 24px;
    align-items: center;

    h4 {
      width: 50%;
      color: ${({ theme }) => theme.headerColor};
    }

    var {
      display: block;
      width: 40%;
      overflow: hidden;
      text-overflow: ellipsis;
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 12px;
      text-align: right;
      color: ${({ theme }) => theme.valueColor};

      p {
        margin: 0;
        text-align: right;
        width: 100%;
      }
    }

    .click-addrese {
      > div {
        justify-content: flex-end;
      }

      svg {
        stroke: ${({ theme }) => theme.valueColor};
        width: 16px;
        margin-left: 8px;
      }
    }
  }
`
