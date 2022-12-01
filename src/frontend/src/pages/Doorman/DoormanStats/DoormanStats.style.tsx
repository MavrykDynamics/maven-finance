import styled from 'styled-components/macro'
import { Card, CardHeader } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'

export const DoormanStatsStyled = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 30px 23px;
  margin-top: 78px;
  position: relative;

  &::after {
    content: '';
    display: block;
    width: 42px;
    height: 3px;
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${({ theme }) => theme.textColor};
    margin-left: auto;
    margin-right: auto;
    margin-top: 16px;
    border-radius: 2px;
  }
`

export const DoormanStatsHeader = styled(CardHeader)<{ theme: MavrykTheme }>`
  text-align: center;
  margin-bottom: 25px;

  font-weight: 600;
  font-size: 18px;
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
    align-items: center;
    margin-bottom: 12px;

    h4 {
      width: 47%;
      color: ${({ theme }) => theme.textColor};
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      display: flex;
      align-items: center;
      font-weight: 600;
      white-space: nowrap;

      a {
        margin-left: 4px;

        svg {
          transition: 0.4s all;
          width: 14px;
          height: 14px;
          fill: ${({ theme }) => theme.textColor};
        }

        &:hover {
          svg {
            opacity: 0.8;
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
      font-size: 16px;
      line-height: 22px;
      text-align: right;
      color: ${({ theme }) => theme.dataColor};

      p {
        margin: 0;
        font-weight: 600;
        font-size: 16px;
        line-height: 22px;
        text-align: right;
        width: 100%;
        font-weight: 600;
        white-space: nowrap;
      }
    }

    .click-address {
      > div {
        justify-content: flex-end;
      }
    }
  }
`
