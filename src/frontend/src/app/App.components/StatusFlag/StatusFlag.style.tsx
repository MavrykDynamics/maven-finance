import styled from 'styled-components/macro'
import { awaitingColor } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const StatusFlagStyled = styled.div<{ theme: MavrykTheme }>`
  border-radius: 10px;
  border: 1px solid;
  text-align: center;
  font-weight: 600;
  width: 110px;
  padding: 0;
  font-size: 12px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.primary {
    color: ${({ theme }) => theme.infoColor};
    border-color: ${({ theme }) => theme.infoColor};
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

  &.waiting {
    color: ${awaitingColor};
    border-color: ${awaitingColor};
  }
`
