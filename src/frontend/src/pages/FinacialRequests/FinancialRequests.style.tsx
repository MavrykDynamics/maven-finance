import styled from 'styled-components/macro'
import { Card, cyanColor, skyColor, royalPurpleColor, headerColor } from 'styles'
import { MavrykTheme } from '../../styles/interfaces'
import { VotingArea as VotingAreaBase } from 'app/App.components/VotingArea/VotingArea.controller'
import { GovRightContainerTitleArea as GovRightContainerTitleAreaBase } from 'pages/Governance/Governance.style'

export const FinancialRequestsStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  margin-top: 30px;
`

export const FinancialRequestsRightContainer = styled(Card)<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  width: calc(50% - 25px);
  padding: 28px 30px;
  border-radius: 10px;
  height: min-content;
  margin-top: 0;
  flex-shrink: 0;
  margin-left: 30px;
  position: relative;
  padding-bottom: 86px;

  &::after {
    position: absolute;
    content: '';
    width: 44px;
    height: 3px;
    border-radius: 10px;
    bottom: 42px;
    left: 50%;
    background-color: ${royalPurpleColor};
    transform: translateX(-50%);
  }

  .voting_ending {
    margin-top: 5px;
    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.dataColor};
  }

  .fr-voting {
    > div {
      justify-content: space-between;
      column-gap: 15px;
      padding-top: 0px;
      button {
        width: 50%;
      }
    }
  }

  hr {
    border: none;
    height: 1px;
    background-color: ${({ theme }) => theme.cardBorderColor};
    margin-bottom: 10px;
  }

  .info_section_wrapper {
    display: flex;
    column-gap: 50px;
  }

  .info_section {
    display: flex;
    flex-direction: column;
    margin-top: 30px;

    .list {
      display: flex;
      flex-direction: column;
      margin-top: 6px;
      width: 100%;

      .list_item {
        display: flex;
        width: 100%;
        justify-content: space-between;
        p {
          margin: 0;
        }
      }
    }
  }
`

export const InfoBlockTitle = styled.div<{ theme: MavrykTheme }>`
  font-weight: 600;
  font-size: 18px;
  line-height: 18px;
  color: ${({ theme }) => theme.textColor};
`

export const InfoBlockName = styled.div<{ theme: MavrykTheme }>`
  font-weight: 500;
  font-size: 14px;
  line-height: 24px;
  margin-top: 5px;
  color: ${({ theme }) => theme.textColor};
`

export const InfoBlockValue = styled(InfoBlockName)`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.dataColor};

  svg {
    width: 22px;
    height: 22px;
    stroke: ${({ theme }) => theme.dataColor};
  }
`

export const FinancialRequestsContainer = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  max-width: 540px;
`

export const VotingArea = styled(VotingAreaBase)`
  margin-top: 25px;
  margin-bottom: 20px;
`
export const GovRightContainerTitleArea = styled(GovRightContainerTitleAreaBase)`
  margin-bottom: 10px;
`
