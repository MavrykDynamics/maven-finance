import styled from 'styled-components/macro'
import { Card, cyanColor, headerColor, skyColor, darkPurpleColor } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'

export const PropSubmissionTopBarStyled = styled(Card)<{ theme: MavrykTheme }>`
  display: flex;
  width: 100%;
  flex-direction: row;
  border-radius: 10px;
  align-items: center;
  height: 75px;
  margin-top: 30px;
  margin-bottom: 0px;
  padding-left: 40px;
  padding-right: 54px;
`

export const PropSubTopBarTabsContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: flex-start;
  align-items: center;
`
export const PropSubTopBarTimeContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  padding-left: 66px;

  .move-to-next {
    width: 220px;
  }
`
export const PropSubTopBarTabsText = styled.div<{ theme: MavrykTheme }>`
  color: ${headerColor};
  font-weight: 600;
  font-size: 18px;
  line-height: 18px;
  margin-right: 18px;
  flex-shrink: 0;
`
export const CurrentPhaseContainer = styled.div<{ theme: MavrykTheme }>`
  display: inline-flex;
  align-items: center;
`
export const PropSubTopBarPhaseText = styled.div<{ isCorrectPhase?: boolean; theme: MavrykTheme }>`
  color: ${headerColor};
  font-weight: 600;
  font-size: 18px;
  line-height: 18px;
`
export const PropSubTopBarValueText = styled.span`
  font-weight: 600;
  font-size: 16px;
  line-height: 16px;
  color: ${cyanColor};
  padding-left: 26px;
  text-transform: capitalize;
`
export const PropSubTopBarEmergencyGovText = styled.div<{ theme: MavrykTheme }>`
  margin: 0 auto;
  color: ${({ theme }) => theme.warningColor};
  font-weight: 800;
  font-size: 25px;
`
export const TimeLeftAreaWrap = styled.div<{ theme: MavrykTheme }>`
  border-left: 2px solid ${darkPurpleColor};
  display: flex;
  height: 38px;
  flex-shrink: 0;
  align-items: center;
  width: 189px;
  text-align: right;
  justify-content: flex-end;
`

export const TimeLeftArea = styled.div<{ theme: MavrykTheme }>`
  color: ${skyColor};
  font-weight: 600;
  font-size: 16px;
  line-height: 16px;
`
