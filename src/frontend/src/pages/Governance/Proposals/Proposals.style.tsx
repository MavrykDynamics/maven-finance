import styled, { css } from 'styled-components/macro'
import { boxShadowColor, cyanColor, royalPurpleColor, skyColor } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'

export const ProposalListContainer = styled.div`
  margin-bottom: 38px;

  > h1 {
    color: ${({ theme }) => theme.headerColor};
    font-size: 25px;
    margin: 0;
  }
`

export const ProposalListItem = styled.div<{ selected: boolean; theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  border: 1px solid ${royalPurpleColor};
  min-height: 57px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px auto;
  padding: 0 18px;
  border-radius: 10px;
  font-weight: 600;
  padding: 8px 28px;
  cursor: pointer;

  ${({ selected }) =>
    selected &&
    css`
      border-color: ${cyanColor};
      box-shadow: 0px 4px 4px ${boxShadowColor};
    `}

  .proposal-voted-mvk {
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: ${skyColor};
    margin-right: 30px;
  }
`

export const ProposalItemLeftSide = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  font-size: 14px;
  align-items: center;
  margin-right: auto;

  > span {
    font-weight: 400;
    margin-right: 30px;
    color: ${({ theme }) => theme.headerColor};
  }

  > h4 {
    font-weight: 600;
    color: ${cyanColor};
    padding-right: 8px;
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
