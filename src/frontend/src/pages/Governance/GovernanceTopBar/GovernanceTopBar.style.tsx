import { MavrykTheme } from '../../../styles/interfaces'
import styled, { keyframes } from 'styled-components/macro'

export const GovernanceTopBarStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  margin: 15px auto;
  display: flex;
  width: 100%;
  height: 50px;
  flex-direction: row;
  border-radius: 10px;
  padding: 10px 20px;
  align-items: center;
  justify-content: space-evenly;

  > button {
    max-width: 20%;
    height: 40px;
  }
`

export const GovTopBarSidewaysArrowIcon = styled.svg<{ theme: MavrykTheme }>`
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: sub;
  margin: 0 15px;
  stroke: ${({ theme }) => theme.subTextColor};
`

export const GovTopBarPhaseText = styled.div<{ isCorrectPhase?: boolean; theme: MavrykTheme }>`
  margin: 0 10px;
  color: ${({ isCorrectPhase, theme }) => (isCorrectPhase ? theme.infoColor : theme.textColor)};
  font-weight: 800;
  font-size: 18px;
`
export const GovTopBarEmergencyGovText = styled.div<{ theme: MavrykTheme }>`
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
