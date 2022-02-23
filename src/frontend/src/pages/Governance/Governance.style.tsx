import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

export const GovernanceStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  display: flex;
  width: 100%;
  flex-direction: row;
`

export const GovernanceRightContainer = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  width: 50%;
  margin: 0 0 0 10px;
  padding: 30px;
  border-radius: 10px;
  height: min-content;

  #votingDeadline {
    font-size: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.subTextColor};
  }
`

export const GovernanceLeftContainer = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  margin-right: 10px;
`

export const GovRightContainerTitleArea = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: inherit;
  justify-content: space-between;
  align-items: center;

  > h1 {
    color: ${({ theme }) => theme.textColor};
    font-size: 25px;
    margin: 0;
  }
  > div {
  }
`

export const RightSideVotingArea = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: row;
  margin: 20px 0;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;

  > button {
    max-width: 40%;
  }
`

export const RightSideSubHeader = styled.div<{ theme: MavrykTheme }>`
  font-size: 18px;
  font-weight: 600;
  margin-top: 35px;
`
export const RightSideSubContent = styled.p<{ theme: MavrykTheme }>`
  font-size: 12px;
  font-weight: normal;
  color: ${({ theme }) => theme.subTextColor};
  word-break: break-all;
`
