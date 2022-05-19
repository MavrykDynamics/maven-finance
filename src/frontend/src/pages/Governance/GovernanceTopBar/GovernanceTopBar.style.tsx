import styled from 'styled-components/macro'
import { Card, cianColor } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'

export const GovernanceTopBarStyled = styled(Card)`
  margin: 30px auto 20px;
  display: flex;
  width: 100%;
  height: 75px;
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
  stroke: ${({ theme }) => theme.connectInfoColor};
`

export const GovTopBarPhaseText = styled.div<{ isCorrectPhase?: boolean; theme: MavrykTheme }>`
  margin: 0 10px;
  color: ${({ isCorrectPhase, theme }) => (isCorrectPhase ? theme.valueColor : theme.headerColor)};
  font-weight: 600;
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
  border-left-color: ${cianColor};
  border-right: none;
  border-top: none;
  border-bottom: none;
  padding: 5px 0 5px 10px;
  color: ${cianColor};
  font-weight: 800;
  font-size: 18px;
`
