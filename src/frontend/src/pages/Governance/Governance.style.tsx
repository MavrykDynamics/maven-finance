import styled from 'styled-components/macro'
import { Card } from 'styles'

import { MavrykTheme } from '../../styles/interfaces'

export const GovernanceStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
`

export const GovernanceRightContainer = styled(Card)<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  width: calc(50% - 25px);
  padding: 28px 30px;
  border-radius: 10px;
  height: min-content;
`

export const GovernanceLeftContainer = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  padding-top: 28px;
`

export const GovRightContainerTitleArea = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: inherit;
  justify-content: space-between;
  align-items: flex-start;

  > h1 {
    color: ${({ theme }) => theme.headerColor};
    font-size: 25px;
    margin: 0;

    &::after {
      margin-bottom: 7px;
    }
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
  color: ${({ theme }) => theme.headerColor};
  word-break: break-all;
`
