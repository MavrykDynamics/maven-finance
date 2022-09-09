import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { BLUE, CYAN, PRIMARY, SECONDARY, TRANSPARENT } from './TzAddress.constants'

export const TzAddressContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`
export const TzAddressStyled = styled.div<{ theme: MavrykTheme }>`
  &.${PRIMARY} {
    color: ${({ theme }) => theme.primaryColor};
  }

  &.${SECONDARY} {
    color: ${({ theme }) => theme.headerColor};
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
  }

  &.${TRANSPARENT} {
    color: ${({ theme }) => theme.backgroundTextColor};
  }

  &.${BLUE} {
    color: ${({ theme }) => theme.dataColor};
  }

  &.${CYAN} {
    color: ${({ theme }) => theme.navTitleColor};
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

  &.${PRIMARY} {
    stroke: ${({ theme }) => theme.backgroundTextColor};
  }

  &.${SECONDARY} {
    stroke: ${({ theme }) => theme.headerColor};
  }

  &.${TRANSPARENT} {
    stroke: ${({ theme }) => theme.primaryColor};
  }

  &.${BLUE} {
    stroke: ${({ theme }) => theme.dataColor};
  }

  &.${CYAN} {
    color: ${({ theme }) => theme.navIconColor};
  }
`
