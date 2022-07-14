import styled, { css } from 'styled-components/macro'
import { Card } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'

export const SatelliteListStyled = styled.div<{ theme: MavrykTheme }>``

export const SatelliteListEmptyContainer = styled.figure<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  color: ${({ theme }) => theme.headerColor};
  font-size: 18px;
  font-weight: 800;
  flex-direction: column;
  padding-top: 16px;
`
export const SatelliteSearchFilter = styled(Card)<{ theme: MavrykTheme; oracle?: boolean }>`
  background-color: ${({ theme }) => theme.containerColor};
  display: flex;
  align-items: center;
  padding: 16px 26px;
  margin-top: 0;
  color: ${({ theme }) => theme.subTextColor};

  input {
    width: 320px;
    height: 40px;
  }

  ${({ oracle }) =>
    oracle
      ? css`
          margin-top: 30px;
        `
      : ''}
`
export const SelectContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`
