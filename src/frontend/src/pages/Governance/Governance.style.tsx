import styled from 'styled-components/macro'
import { Card, cyanColor, skyColor, royalPurpleColor, headerColor } from 'styles'

import { MavrykTheme } from '../../styles/interfaces'

export const GovernanceStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: center;
`

export const GovernanceRightContainer = styled(Card)<{ isAuthorized?: boolean, theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  width: calc(50% - 30px);
  padding: 28px 30px;
  border-radius: 10px;
  height: min-content;
  margin-top: ${({ isAuthorized }) => isAuthorized ? 0 : 28}px;
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
  }

  article {
    margin-bottom: 18px;

    a {
      text-decoration: underline;
    }

    li {
      &::marker {
        color: ${skyColor};
      }
    }

    h4 {
      font-weight: 700;
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
      color: ${cyanColor};

      p {
        color: ${skyColor};
        margin: 0;
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
    font-weight: 400;
    margin-bottom: 30px;

    li {
      margin-bottom: 6px;
    }
  }
  .visible-button {
    text-decoration: underline;
    color: ${headerColor};
    cursor: pointer;
    position: relative;
    top: -1px;
  }

  .proposal-list-title {
    font-weight: 700;
    color: ${skyColor};
  }

  .proposal-list-title-valie {
    color: ${cyanColor};
  }

  .proposal-list-bites {
    word-break: break-all;
    color: ${skyColor};
  }

  .drop-proposal {
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
    padding-bottom: 20px;

    button {
      width: 194px;
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

  > h1 {
    margin: 0;

    &::after {
      margin-bottom: 7px;
    }
  }

  &.financial-request {
    h1 {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
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
  color: ${({ theme }) => theme.headerColor};
`
export const RightSideSubContent = styled.div<{ theme: MavrykTheme }>`
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  font-weight: normal;
  word-break: break-all;

  &, a {
    color: ${skyColor};
  }

  .address {
    * {
      color: ${cyanColor};
      stroke: ${cyanColor};
    }
  } 

  &#votingDeadline {
    color: ${cyanColor};
    font-size: 12px;
    line-height: 1;
    font-weight: 600;

    * {
      color: ${cyanColor};
    }
  }
`
