import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const TzAddressContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`
export const TzAddressStyled = styled.div<{ theme: MavrykTheme }>`
  &.primary {
    color: ${({ theme }) => theme.primaryColor};
  }

  &.secondary {
    color: ${({ theme }) => theme.headerColor};
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
  }

  &.transparent {
    color: ${({ theme }) => theme.backgroundTextColor};
  }

  &.bold {
    font-weight: 600;
  }
`

export const TzAddressIcon = styled.svg<{ theme: MavrykTheme }>`
  width: 16px;
  height: 16px;
  display: inline-block;
  vertical-align: sub;
  margin-left: 8px;

  &.primary {
    stroke: ${({ theme }) => theme.backgroundTextColor};
  }

  &.secondary {
    stroke: ${({ theme }) => theme.headerColor};
  }

  &.transparent {
    stroke: ${({ theme }) => theme.primaryColor};
  }
`
