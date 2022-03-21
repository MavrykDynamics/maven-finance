import styled, { keyframes } from 'styled-components/macro'
import { MavrykTheme } from '../../../../styles/interfaces'
import { upColor } from '../../../../styles'

const dropShadow = keyframes`
  0% {
    box-shadow: 0 0 0 0 ${upColor};
  }

  100% {
    box-shadow: 0 0 10px 0 ${upColor};
  }
`

export const VotingContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  margin: 20px 0;

  text-align: end;
`
export const QuorumBar = styled.div<{ width: number; theme: MavrykTheme }>`
  width: ${({ width }) => width}%;
  min-width: fit-content;
  border: 1px solid;
  border-right-color: ${({ theme }) => theme.placeholderTextColor};
  border-top: none;
  border-bottom: none;
  border-left: none;
  padding: 10px 10px 10px 0;
  margin-bottom: 10px;
`
export const VotingBarStyled = styled.div<{ theme: MavrykTheme }>`
  z-index: 20;
  height: 10px;
  display: flex;
  flex-direction: row;

  > div {
    height: 100%;
    min-width: 5%;
  }
`

export const VotingFor = styled.div<{ width: number; theme: MavrykTheme }>`
  border-radius: 10px 0 0 10px;
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.upColor};
  animation: ${dropShadow} 10s ease-in-out 0s infinite normal forwards;
`

export const VotingAgainst = styled.div<{ width: number; theme: MavrykTheme }>`
  border-radius: 0 10px 10px 0;
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.downColor};
`
export const VotingAbstention = styled.div<{ width: number; theme: MavrykTheme }>`
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.infoColor};
`
export const NotYetVoted = styled.div<{ width: number; theme: MavrykTheme }>`
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.selectedColor};
`
