import styled, { css } from 'styled-components/macro'
import { CardHover, boxShadowColor, cyanColor, royalPurpleColor, skyColor } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'

export const ProposalListContainer = styled.div`
  margin-bottom: 38px;

  .voters-list {
    margin-top: 30px;
  }
`

export const ProposalListItem = styled(CardHover)<{ selected: boolean; theme: MavrykTheme }>`
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

export const VoterListItem = styled(CardHover)<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  border: 1px solid ${royalPurpleColor};
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px auto;
  border-radius: 10px;
  font-weight: 600;
  padding: 14px 24px;

  .left {
    display: flex;
    column-gap: 10px;

    .avatar {
      width: 45px;
      height: 45px;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }
    }
    .info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      row-gap: 5px;

      span {
        color: ${({ theme }) => theme.textColor};
      }

      div {
        font-size: 16px;
        color: ${({ theme }) => theme.dataColor};
        align-items: flex-start;

        svg {
          stroke: ${({ theme }) => theme.dataColor};
          stroke-width: 0.5px;
          width: 22px;
          height: 22px;
        }
      }
    }
  }
`

export const VoteStatusFlag = styled.div<{ status: ProposalStatus; theme: MavrykTheme }>`
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

export const ProposalItemLeftSide = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  font-size: 14px;
  align-items: center;
  margin-right: auto;

  > span {
    font-weight: 400;
    width: 40px;
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
