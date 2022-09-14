import styled from 'styled-components/macro'
import { Card, CardHeader, cyanColor } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'

export const DoormanStatsStyled = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 25px 44px;
  position: relative;

  &::after {
    content: '';
    display: block;
    width: 42px;
    height: 3px;
    position: absolute;
    bottom: 25px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${({ theme }) => theme.cardBorderColor};
    margin-left: auto;
    margin-right: auto;
    margin-top: 16px;
    border-radius: 2px;
  }
`

export const DoormanStatsHeader = styled(CardHeader)<{ theme: MavrykTheme }>`
  text-align: center;
  margin-bottom: 16px;
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

export const DoormanList = styled.aside<{ theme: MavrykTheme }>`
  > div {
    display: flex;
    justify-content: space-between;
    height: 35px;
    align-items: center;

    h4 {
      width: 47%;
      color: ${({ theme }) => theme.headerColor};
      font-size: 12px;
      display: flex;
      align-items: center;
      font-weight: 600;

      a {
        margin-left: 4px;

        svg {
          transition: 0.4s all;
          width: 14px;
          height: 14px;
          fill: ${({ theme }) => theme.headerColor};
        }

        &:hover {
          svg {
            fill: ${cyanColor};
          }
        }
      }
    }

    var {
      display: block;
      width: 50%;
      overflow: hidden;
      text-overflow: ellipsis;
      font-style: normal;
      font-weight: 600;
      font-size: 12px;
      line-height: 12px;
      text-align: right;
      color: ${({ theme }) => theme.valueColor};

      p {
        margin: 0;
        font-size: 12px;
        text-align: right;
        width: 100%;
        font-weight: 600;
      }
    }

    .click-address {
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
