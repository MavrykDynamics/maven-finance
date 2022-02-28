import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'

export const ProposalListContainer = styled.div`
  > h1 {
    color: ${({ theme }) => theme.textColor};
    font-size: 25px;
    margin: 15px 0 0 0;
  }
`

export const ProposalListItem = styled.div<{ selected: boolean; theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 56px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px auto;
  padding: 0 25px;
  border-radius: 15px;
  font-weight: 600;

  ${({ selected }) =>
    selected &&
    css`
      box-shadow: 2px 4px 4px ${({ theme }) => theme.boxShadowColor};
    `}
`

export const ProposalItemLeftSide = styled.div<{ theme: MavrykTheme }>`
  display: flex;

  > div {
    margin-right: 10px;
    color: ${({ theme }) => theme.subTextColor};
  }

  > h4 {
    font-weight: 600;
  }
`

export const ProposalStatusFlag = styled.div<{ status: ProposalStatus; theme: MavrykTheme }>`
  padding: 9px 25px;
  border-radius: 10px;
  border: 1px solid;
  border-color: ${({ status }) => {
    switch (status) {
      case ProposalStatus.EXECUTED:
        return ({ theme }) => theme.upColor
      case ProposalStatus.DEFEATED:
        return ({ theme }) => theme.downColor
      case ProposalStatus.ONGOING:
        return ({ theme }) => theme.primaryColor
      default:
        return ({ theme }) => theme.infoColor
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case ProposalStatus.EXECUTED:
        return ({ theme }) => theme.upColor
      case ProposalStatus.DEFEATED:
        return ({ theme }) => theme.downColor
      case ProposalStatus.ONGOING:
        return ({ theme }) => theme.primaryColor
      default:
        return ({ theme }) => theme.infoColor
    }
  }};
`
