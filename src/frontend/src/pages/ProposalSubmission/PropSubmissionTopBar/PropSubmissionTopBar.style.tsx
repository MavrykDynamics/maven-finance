import { MavrykTheme } from '../../../styles/interfaces'
import styled from 'styled-components/macro'

export const PropSubmissionTopBarStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  margin: 15px auto;
  display: flex;
  width: 100%;
  flex-direction: row;
  border-radius: 10px;
  padding: 10px 20px;
  align-items: center;
  justify-content: space-evenly;
`

export const PropSubTopBarTabsContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: center;
  align-items: center;
`
export const PropSubTopBarTimeContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: row;
  min-width: 40%;
  justify-content: space-evenly;
  align-items: center;
`
export const PropSubTopBarTabsText = styled.div<{ theme: MavrykTheme }>`
  margin: 0 10px;
  color: ${({ theme }) => theme.textColor};
  font-weight: 800;
  font-size: 24px;
  flex-grow: 0;
  max-width: fit-content;
`
export const CurrentPhaseContainer = styled.div<{ theme: MavrykTheme }>`
  display: inline-flex;
`
export const PropSubTopBarPhaseText = styled.div<{ isCorrectPhase?: boolean; theme: MavrykTheme }>`
  margin: 0 10px;
  color: ${({ isCorrectPhase, theme }) => (isCorrectPhase ? theme.infoColor : theme.textColor)};
  font-weight: 800;
  font-size: 24px;

  &#isPhaseText {
    color: ${({ theme }) => theme.infoColor};
  }
`
export const PropSubTopBarEmergencyGovText = styled.div<{ theme: MavrykTheme }>`
  margin: 0 auto;
  color: ${({ theme }) => theme.warningColor};
  font-weight: 800;
  font-size: 25px;
`
export const TimeLeftArea = styled.div<{ theme: MavrykTheme }>`
  border: 1px solid;
  border-left-color: ${({ theme }) => theme.textColor};
  border-right: none;
  border-top: none;
  border-bottom: none;
  padding: 5px 0 5px 10px;
  color: ${({ theme }) => theme.textColor};
  font-weight: 800;
  font-size: 18px;
`
