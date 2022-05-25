import styled from 'styled-components/macro'
import { Card, cyanColor, skyColor } from 'styles'

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
  margin-top: 0;
  flex-shrink: 0;
  margin-left: 30px;

  article {
    margin-bottom: 18px;
    a {
      text-decoration: underline;
    }
  }

  hr {
    border: none;
    height: 1px;
    background-color: ${({ theme }) => theme.cardBorderColor};
    margin-top: 40px;
    margin-bottom: 40px;
  }
`

export const GovernanceLeftContainer = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  padding-top: 28px;
`

export const GovRightContainerTitleArea = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: inherit;
  justify-content: space-between;
  align-items: flex-start;

  > h1 {
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
  margin-bottom: 12px;
  color: ${({ theme }) => theme.headerColor};
`
export const RightSideSubContent = styled.p<{ theme: MavrykTheme }>`
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  font-weight: normal;
  color: ${skyColor};
  word-break: break-all;

  * {
    color: ${skyColor};
    stroke: ${skyColor};
  }

  &#votingDeadline {
    color: ${cyanColor};
    font-size: 12px;
    line-height: 1;
  }
`
