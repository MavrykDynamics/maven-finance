import styled, { css } from 'styled-components/macro'
import { Card, skyColor } from 'styles'

import { MavrykTheme } from '../../styles/interfaces'

export const EmergencyGovernanceCard = styled(Card)<{ theme: MavrykTheme }>`
  padding-top: 28px;

  p {
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: ${skyColor};
    margin: 0;

    div {
      margin: 8px 0;
      margin-bottom: 13px;
      font-size: 12px;

      a {
        font-size: 13px;
      }
    }
  }

  h1 {
    margin-top: 0;
    margin-bottom: 0;
  }
`

export const CardContentLeftSide = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  align-items: center;
  justify-content: center;
`
export const CardContent = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;
  justify-content: center;
`
export const CardContentRightSide = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  align-items: center;
  justify-content: flex-end;
  display: flex;

  button {
    max-width: 250px;
  }

  > div {
    align-items: center;
    justify-content: flex-end;
    display: flex;
    margin: 0;
  }
`

export const EmergencyGovernHistory = styled.div<{ theme: MavrykTheme }>`
  padding-top: 39px;

  > h1 {
    margin: 0;
    margin-bottom: 10px;
  }
`

export const BGTextWithStatus = styled.div<{ status: boolean; theme: MavrykTheme }>`
  color: ${({ status, theme }) => (status ? theme.downColor : theme.upColor)};
  font-weight: 600;
  font-size: 22px;
`
