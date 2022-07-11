import styled, { keyframes } from 'styled-components/macro'
import { subTextColor, upColor, skyColor } from 'styles'

import { MavrykTheme } from '../../../../styles/interfaces'

const dropShadow = keyframes`
  0% {
    box-shadow: 0 0 0 0 ${upColor};
  }

  100% {
    box-shadow: 0 0 10px 0 ${upColor};
  }
`

export const VotingContainer = styled.aside<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  margin-top: 42px;

  text-align: end;
`
export const QuorumBar = styled.div<{ width: number; theme: MavrykTheme }>`
  width: ${({ width }) => width}%;
  min-width: fit-content;
  border: 1px solid;
  border-right-color: ${({ theme }) => theme.headerColor};
  border-top: none;
  border-bottom: none;
  border-left: none;
  padding: 4px 9px 4px 0;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.headerColor};
  font-weight: 400;
  font-size: 12px;

  b {
    font-weight: 700;
    font-size: 14px;
  }
`
export const VotingBarStyled = styled.div<{ theme: MavrykTheme }>`
  z-index: 11;
  height: 4px;
  display: flex;
  flex-direction: row;

  > div {
    height: 100%;
    min-width: 5%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;

    > div {
      font-size: 12px;
      margin-top: 14px;
      position: absolute;
      left: 0;
      overflow: hidden;
      width: 100%;
      text-align: left;
      text-overflow: ellipsis;
    }
  }
`

export const VotingFor = styled.div<{ width: number; theme: MavrykTheme }>`
  border-radius: 10px 0 0 10px;
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.upColor};
  color: ${({ theme }) => theme.upColor};
  animation: ${dropShadow} 10s ease-in-out 0s infinite normal forwards;
`

export const VotingAgainst = styled.div<{ width: number; theme: MavrykTheme }>`
  border-radius: 0 10px 10px 0;
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.downColor};
  color: ${({ theme }) => theme.downColor};
`
export const VotingAbstention = styled.div<{ width: number; theme: MavrykTheme }>`
  width: ${({ width }) => width}%;
  background-color: ${skyColor};
  color: ${skyColor};
`
export const NotYetVoted = styled.div<{ width: number; theme: MavrykTheme }>`
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.selectedColor};
  color: ${subTextColor};
`
