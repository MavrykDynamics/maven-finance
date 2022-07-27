import styled, { css } from 'styled-components/macro'
import { Card, cyanColor, skyColor, royalPurpleColor, headerColor, boxShadowColor } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'

export const FRListWrapper = styled.div<{ theme: MavrykTheme }>`
  margin-bottom: 37px;

  &.oracle {
    margin-top: 30px;

    h1 {
      margin-bottom: 15px;
    }

    .first {
      margin-top: 0;
    }

    .last {
      margin-bottom: 0;
    }
  }
`

export const ListItemLeftSide = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  font-size: 14px;
  align-items: center;
  margin-right: auto;

  > span {
    font-weight: 400;
    margin-right: 30px;
    color: ${({ theme }) => theme.headerColor};
  }

  > h4 {
    font-weight: 600;
    color: ${cyanColor};
    padding-right: 8px;
  }

  &.financial-request {
    h4 {
      max-width: 335px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`

export const FRListItem = styled.div<{ selected: boolean; theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  border: 1px solid ${royalPurpleColor};
  min-height: 57px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px auto;
  padding: 0 18px;
  border-radius: 10px;
  font-weight: 600;
  padding: 8px 28px;
  cursor: pointer;

  ${({ selected }) =>
    selected &&
    css`
      border-color: ${cyanColor};
      box-shadow: 0px 4px 4px ${boxShadowColor};
    `}

  .proposal-voted-mvk {
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: ${skyColor};
    margin-right: 30px;
  }
`
