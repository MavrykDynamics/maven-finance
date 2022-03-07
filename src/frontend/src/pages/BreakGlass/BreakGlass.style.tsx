import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

export const BreakGlassStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  width: 100%;

  > h1 {
    margin: 10px auto 10px 0;
  }
`
export const BreakGlassTop = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-bottom: 30px;
`
export const BreakGlassTopLeftCard = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  width: 30%;
  height: 100px;
  margin-right: 15px;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: inherit;

  > div {
    display: inline-flex;
    justify-content: space-between;
  }
`
export const BreakGlassTopRightCard = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  width: 68%;
  height: 100px;
  margin-left: 15px;
  border-radius: 10px;
  padding: 20px;
`
export const BreakGlassContractCardsContainer = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  display: flex;
  flex-direction: row;
`

export const BGTitle = styled.h1<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.textColor};
  font-weight: 700;
  font-size: 24px;
`
export const BGTextTitle = styled.h2<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.textColor};
  font-weight: 700;
  font-size: 24px;
`

export const BGTextWithStatus = styled.div<{ status: boolean; theme: MavrykTheme }>`
  color: ${({ status, theme }) => (status ? theme.downColor : theme.upColor)};
  font-weight: 600;
  font-size: 22px;
`

export const BGContractCard = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  width: 300px;
  border-radius: 10px;
  padding: 20px;
  margin: 15px;
`
export const ContractCardTitleStatusContainer = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  height: 70%;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
`

export const ContractCardToggleContainer = styled.p<{ theme: MavrykTheme }>`
  width: 100%;
  height: 70%;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
`
