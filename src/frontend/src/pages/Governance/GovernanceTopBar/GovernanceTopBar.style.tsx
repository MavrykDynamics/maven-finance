import styled from 'styled-components/macro'
import { Card, cyanColor, darkPurpleColor } from 'styles'

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

  > button {
    max-width: 20%;
    height: 40px;
  }

  .right-block {
    margin-left: auto;
    padding-right: 35px;
    width: 223px;
    display: flex;
    justify-content: flex-end;
  }

  .move-to-next {
    margin-left: auto;
    height: 50px;
    width: 250px;
    max-width: none;
    margin-right: 8px;
  }
`

export const GovTopBarSidewaysArrowIcon = styled.svg<{ theme: MavrykTheme }>`
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: sub;
  margin: 0;
  fill: ${({ theme }) => theme.headerColor};
`

export const GovTopBarPhaseText = styled.div<{ isCorrectPhase?: boolean; theme: MavrykTheme }>`
  margin: 0 10px;
  color: ${({ isCorrectPhase, theme }) => (isCorrectPhase ? theme.valueColor : theme.textColor)};
  font-weight: 600;
  font-size: 18px;
  width: 146px;
  text-align: center;

  &.first {
    width: 140px;
    width: 98px;
    margin-left: 20px;
    text-align: left;
  }
`
export const GovTopBarEmergencyGovText = styled.div<{ theme: MavrykTheme }>`
  margin: 0 auto;
  color: ${({ theme }) => theme.warningColor};
  font-weight: 800;
  font-size: 25px;
`
export const TimeLeftArea = styled.div<{ theme: MavrykTheme }>`
  border: 2px solid;
  border-left-color: ${darkPurpleColor};
  border-right: none;
  border-top: none;
  border-bottom: none;
  padding: 5px 0 5px 10px;
  color: ${cyanColor};
  font-weight: 600;
  font-size: 16px;
  width: 100%;
  text-align: right;
  line-height: 28px;
`
