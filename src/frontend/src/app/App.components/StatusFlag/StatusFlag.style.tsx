import styled from 'styled-components/macro'

import { MavrykTheme } from '../../../styles/interfaces'

export const StatusFlagStyled = styled.div<{ theme: MavrykTheme }>`
  padding: 9px 25px;
  border-radius: 10px;
  border: 1px solid;
  text-align: center;
  font-weight: 600;

  &.primary {
    color: ${({ theme }) => theme.primaryColor};
    border-color: ${({ theme }) => theme.primaryColor};
  }

  &.up {
    color: ${({ theme }) => theme.upColor};
    border-color: ${({ theme }) => theme.upColor};
  }

  &.down {
    color: ${({ theme }) => theme.downColor};
    border-color: ${({ theme }) => theme.downColor};
  }

  &.info {
    color: ${({ theme }) => theme.infoColor};
    border-color: ${({ theme }) => theme.infoColor};
  }

  &.warning {
    color: ${({ theme }) => theme.warningColor};
    border-color: ${({ theme }) => theme.warningColor};
  }
`
