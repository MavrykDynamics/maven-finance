import styled from 'styled-components/macro'
import { awaitingColor } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'
import { DOWN, INFO, PRIMARY, UP, WAITING, WARNING } from './StatusFlag.constants'

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

  &.${PRIMARY} {
    color: ${({ theme }) => theme.infoColor};
    border-color: ${({ theme }) => theme.infoColor};
  }

  &.${UP} {
    color: ${({ theme }) => theme.upColor};
    border-color: ${({ theme }) => theme.upColor};
  }

  &.${DOWN} {
    color: ${({ theme }) => theme.downColor};
    border-color: ${({ theme }) => theme.downColor};
  }

  &.${INFO} {
    color: ${({ theme }) => theme.infoColor};
    border-color: ${({ theme }) => theme.infoColor};
  }

  &.${WARNING} {
    color: ${({ theme }) => theme.warningColor};
    border-color: ${({ theme }) => theme.warningColor};
  }

  &.${WAITING} {
    color: ${awaitingColor};
    border-color: ${awaitingColor};
  }
`
