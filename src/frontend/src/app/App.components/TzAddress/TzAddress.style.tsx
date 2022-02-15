import styled from 'styled-components/macro'
import { backgroundColor, backgroundTextColor, primaryColor, subTextColor, textColor } from 'styles'
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
    margin: 8px 8px 8px 0;
    color: ${({ theme }) => theme.subTextColor};
  }

  &.transparent {
    color: ${({ theme }) => theme.backgroundTextColor};
  }

  &.bold {
    font-weight: 600;
  }
`

export const TzAddressIcon = styled.svg<{ theme: MavrykTheme }>`
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: sub;

  &.primary {
    stroke: ${({ theme }) => theme.backgroundTextColor};
  }

  &.secondary {
    stroke: ${({ theme }) => theme.subTextColor};
  }

  &.transparent {
    stroke: ${({ theme }) => theme.primaryColor};
  }
`
