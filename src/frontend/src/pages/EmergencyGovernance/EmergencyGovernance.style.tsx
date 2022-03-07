import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

export const EmergencyGovernanceStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  width: 100%;

  > h1 {
    margin: 10px auto 10px 0;
  }
`
export const EmergencyGovernanceTopBar = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  width: 100%;
  border-radius: 10px;
  padding: 15px 25px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: inherit;
  > h1 {
    margin: 10px auto 10px 0;
    color: ${({ theme }) => theme.textColor};
    font-weight: 700;
    font-size: 25px;
  }
`
export const EmergencyGovernanceCardContent = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  width: 100%;
  padding: 15px 25px;
  margin-bottom: 30px;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`
export const CardContentLeftSide = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  align-items: center;
  justify-content: center;
  > h1 {
    margin: 10px auto 10px 0;
    color: ${({ theme }) => theme.textColor};
    font-weight: 700;
    font-size: 25px;
  }
  > div {
    width: 200px;
  }
`
export const CardContentRightSide = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  align-items: center;
  justify-content: center;
  display: flex;
  > div {
    width: 240px;
  }
`

export const EmergencyGovernHistory = styled.div<{ theme: MavrykTheme }>`
  margin-left: 25px;

  > h1 {
    margin: 10px auto 10px 0;
    color: ${({ theme }) => theme.textColor};
    font-weight: 700;
    font-size: 25px;
  }
`

export const BGTextWithStatus = styled.div<{ status: boolean; theme: MavrykTheme }>`
  color: ${({ status, theme }) => (status ? theme.downColor : theme.upColor)};
  font-weight: 600;
  font-size: 22px;
`
