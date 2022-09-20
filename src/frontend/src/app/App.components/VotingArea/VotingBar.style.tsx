import styled, { keyframes } from 'styled-components/macro'
import { subTextColor, upColor, skyColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

const dropShadow = keyframes`
  0% {
    box-shadow: 0 0 0 0 ${upColor};
  }

  100% {
    box-shadow: 0 0 10px 0 ${upColor};
  }
`

export const VotingContainer = styled.aside<{ theme: MavrykTheme; showButtons?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-top: 42px;
  margin-bottom: ${({ showButtons }) => (showButtons ? 0 : '42px')};
  text-align: end;
  width: 100%;
  position: relative;
`
export const QuorumBar = styled.div<{ width: number; theme: MavrykTheme }>`
  width: 100%;

  .text {
    color: ${({ theme }) => theme.headerColor};
    top: -27px;
    font-weight: 400;
    font-size: 12px;
    width: fit-content;
    position: absolute;
    left: ${({ width }) => width}%;
    transform: translateX(-30%);
    padding-bottom: 15px;

    &::before {
      content: '▼';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: ${({ width }) => `translateX(${width < 5 ? -150 : -100}%)`};
      color: ${({ theme }) => theme.headerColor};
    }
  }
`
export const VotingBarStyled = styled.div<{ theme: MavrykTheme }>`
  z-index: 10;
  height: 4px;
  display: flex;
  flex-direction: row;

  > div:not(.text):not(.voting-tooltip) {
    height: 100%;
    min-width: 5%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;

    > div:not(.text):not(.voting-tooltip) {
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
  cursor: pointer;

  &:hover {
    .text {
      visibility: visible;
      opacity: 1;
    }
  }
`

export const VotingAgainst = styled.div<{ width: number; theme: MavrykTheme }>`
  border-radius: 0 10px 10px 0;
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.downColor};
  color: ${({ theme }) => theme.downColor};
  cursor: pointer;

  &:hover {
    .text {
      visibility: visible;
      opacity: 1;
    }
  }
`
export const VotingAbstention = styled.div<{ width: number; theme: MavrykTheme }>`
  width: ${({ width }) => width}%;
  background-color: ${skyColor};
  color: ${skyColor};
  cursor: pointer;

  &:hover {
    .text {
      visibility: visible;
      opacity: 1;
    }
  }
`
export const NotYetVoted = styled.div<{ width: number; theme: MavrykTheme }>`
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.selectedColor};
  color: ${subTextColor};
  cursor: pointer;

  &:hover {
    .text {
      visibility: visible;
      opacity: 1;
    }
  }
`
