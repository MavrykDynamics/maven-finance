import styled, { css } from 'styled-components/macro'
import { CardHover, boxShadowColor, cyanColor, royalPurpleColor, skyColor } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'

export const ProposalListContainer = styled.div<{ theme: MavrykTheme }>`
  margin-bottom: 38px;
  position: relative;

  .voters-list {
    margin-top: 30px;
  }

  .proposal-history-checkbox {
    margin: 15px 0 15px 0;
  }

  .cycle-dropdown {
    max-width: 260px;
    position: absolute;
    top: 0;
    right: 0;
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
    font-size: 14px;
    color: ${skyColor};
    margin-right: 10px;
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

export const ProposalItemLeftSide = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  font-size: 14px;
  align-items: center;
  margin-right: auto;
  color: ${({ theme }) => theme.textColor};

  > span {
    font-weight: 600;
    width: 25px;
  }

  > h4 {
    font-weight: 600;
    padding-right: 8px;
  }
`

export const ProposalStatusFlag = styled.div<{ status?: ProposalStatus; theme: MavrykTheme }>`
  border-radius: 10px;
  font-size: 12px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  width: 110px;
  border-color: ${({ status }) => {
    switch (status) {
      case ProposalStatus.EXECUTED:
        return ({ theme }) => theme.upColor
      case ProposalStatus.DEFEATED:
        return ({ theme }) => theme.downColor
      case ProposalStatus.ONGOING:
        return ({ theme }) => theme.primaryColor
      default:
        return ({ theme }) => theme.dataColor
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
        return ({ theme }) => theme.dataColor
    }
  }};
`
