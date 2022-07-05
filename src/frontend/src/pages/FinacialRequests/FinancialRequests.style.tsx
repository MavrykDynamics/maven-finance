import styled from 'styled-components/macro'
import { Card, cyanColor, skyColor, royalPurpleColor, headerColor } from 'styles'

import { MavrykTheme } from '../../styles/interfaces'

export const FinancialRequestsRightContainer = styled(Card)<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  width: calc(50% - 30px);
  padding: 28px 30px;
  border-radius: 10px;
  height: min-content;
  margin-top: 0;
  flex-shrink: 0;
  margin-left: 30px;
  position: relative;
  padding-bottom: 55px;

  &::after {
    position: absolute;
    content: '';
    width: 44px;
    height: 3px;
    border-radius: 10px;
    bottom: 42px;
    left: 50%;
    background-color: ${royalPurpleColor};
    transform: translateX(-50%);
  }

  hr {
    border: none;
    height: 1px;
    background-color: ${({ theme }) => theme.cardBorderColor};
    margin-top: 16px;
    margin-bottom: 40px;
  }

  .payment-data {
    margin-bottom: 25px;
  }

  .proposal-list {
    padding-left: 20px;
    font-size: 14px;
    line-height: 21px;
    font-weight: 400;
    margin-bottom: 30px;

    li {
      margin-bottom: 6px;
    }

    label {
      text-decoration: underline;
      color: ${headerColor};
      cursor: pointer;
      position: relative;
      top: -1px;
    }
  }

  .proposal-list-title {
    font-weight: 700;
    color: ${skyColor};
  }

  .proposal-list-title-valie {
    color: ${cyanColor};
  }

  .proposal-list-bites {
    word-break: break-all;
    color: ${skyColor};
  }
`

export const FinancialRequestsContainer = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  padding-top: 28px;
`
