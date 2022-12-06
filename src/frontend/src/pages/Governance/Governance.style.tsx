import styled from 'styled-components/macro'
import { Card, cyanColor, skyColor, royalPurpleColor, headerColor } from 'styles'
import { MavrykTheme } from '../../styles/interfaces'
import { EmptyContainer as EmptyContainerBase } from 'app/App.style'

export const GovernanceStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  width: 100%;
  flex-direction: row;
  margin-top: 32px;

  .empty {
    position: unset;
    margin: 0 auto;
    transform: unset;
  }
`

export const GovernanceRightContainer = styled(Card)<{ isAuthorized?: boolean; theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  width: calc(50% - 30px);
  padding: 28px 30px;
  border-radius: 10px;
  height: min-content;
  margin-top: ${({ isAuthorized }) => (isAuthorized ? 0 : 28)}px;
  flex-shrink: 0;
  margin-left: 30px;
  position: relative;
  padding-bottom: 55px;

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

  .info-block {
    margin-top: 40px;
    margin-bottom: 40px;

    & + .voting-proposal {
      display: none;
    }

    svg {
      stroke: none;
      fill: ${({ theme }) => theme.headerColor};
    }
  }

  .byte,
  .hide {
    svg {
      width: 16px;
      height: 16px;
      display: inline-block;
      vertical-align: sub;
      margin-left: 4px;
      stroke: ${cyanColor};
    }

    button {
      margin: 0;
      padding: 0;
      text-align: left;
      line-height: inherit;
      font-size: inherit;
    }
  }

  .byte-input {
    visibility: hidden;
    position: absolute;
    width: 1px;
    height: 1px;
  }

  .execute-proposal {
    width: 194px;
    align-self: flex-end;
  }

  .voting-proposal {
    display: flex;
    flex-direction: column;

    .execute-proposal {
      margin-top: 16px;
    }
  }

  article {
    margin-bottom: 18px;

    a {
      text-decoration: underline;
    }

    li {
      &::marker {
        color: ${({ theme }) => theme.textColor};
      }
    }

    h4 {
      font-weight: 500;
      font-size: 14px;
      line-height: 21px;
      color: ${headerColor};
    }

    .governance-contract {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 14px;
      line-height: 14px;
      color: ${({ theme }) => theme.dataColor};

      svg {
        stroke: ${({ theme }) => theme.dataColor};
      }

      p {
        margin: 0;
        color: ${({ theme }) => theme.textColor};
      }
    }

    table {
      table-layout: fixed;

      td {
        font-size: 12px;
        word-break: break-all;
        line-height: 17px;
        padding-top: 4px;
        padding-bottom: 5px;

        * {
          text-align: center;
          width: 100%;
        }
      }
    }
  }

  hr {
    border: none;
    height: 1px;
    background-color: ${({ theme }) => theme.cardBorderColor};
    margin-top: 16px;
    margin-bottom: 40px;
  }

  .payment-data {
    margin-bottom: 25px;
  }

  .proposal-list {
    padding-left: 20px;
    font-size: 14px;
    line-height: 21px;
    font-weight: 500;
    margin-bottom: 30px;
    color: ${({ theme }) => theme.textColor};

    li {
      margin-bottom: 6px;

      svg {
        stroke: ${({ theme }) => theme.textColorHovered};
      }
    }
  }
  .visible-button {
    color: ${({ theme }) => theme.textColorHovered};
    cursor: pointer;
    position: relative;
    font-weight: 500;
    top: -1px;
  }

  .proposal-list-bites {
    word-break: break-all;
    color: ${({ theme }) => theme.dataColor};
    button {
      font-weight: 500;
    }
  }

  .drop-proposal {
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
    padding-bottom: 20px;

    font-weight: 600;
    font-size: 16px;
    line-height: 16px;

    button {
      width: 194px;
    }

    svg {
      position: relative;
      top: 3px;
      width: 18px;
      height: 18px;
    }
  }
` //GovernanceRightContainer

export const GovernanceLeftContainer = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  padding-top: 28px;
`

export const GovRightContainerTitleArea = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: inherit;
  justify-content: space-between;
  align-items: flex-start;

  > h1,
  h2 {
    margin: 0;
    font-weight: 700;

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
  margin-bottom: 10px;
  color: ${({ theme }) => theme.textColor};
`
export const RightSideSubContent = styled.div<{ theme: MavrykTheme }>`
  margin-top: 10px;
  font-weight: 500;
  font-size: 14px;
  line-height: 24px;
  font-weight: normal;
  word-break: break-all;
  color: ${({ theme }) => theme.dataColor};

  a {
    color: ${({ theme }) => theme.textColorHovered};
  }

  & {
    font-weight: 500;
  }

  .address {
    stroke: ${({ theme }) => theme.dataColor};
  }

  &#votingDeadline {
    color: ${({ theme }) => theme.dataColor};
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
  }
`

export const EmptyContainer = styled(EmptyContainerBase)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`
