import styled from 'styled-components/macro'
import { headerColor, CardHover, royalPurpleColor, containerColor } from 'styles'

// types
import { MavrykTheme } from 'styles/interfaces'

// components
import { TabSwitcher as TabSwitcherBase } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

export const CouncilStyled = styled.section`
  .pending {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 30px;
  }

  .pending-items {
    width: 750px;
  }

  h1 {
    margin-top: 29px;
    margin-bottom: 11px;

    small {
      font-weight: normal;
      font-size: 0.7em;
    }
  }

  .council-details {
    display: flex;
    padding-top: 30px;

    &.is-user-member,
    &.is-pending-signature {
      padding-top: 0;
    }
  }

  .council-members {
    width: 309px;
    margin-left: 30px;
    flex-shrink: 0;

    &.is-user-member {
      padding-top: 30px;
    }

    &.is-pending-list {
      padding-top: 86px;
    }

    h1 {
      margin-top: 0;
      margin-bottom: 9px;
    }

    &.is-user-member {
      h1 {
        margin-top: 22px;
      }
    }
  }

  .council-actions {
    width: 100%;
  }

  .past-actions {
    margin-top: 0;
    margin-bottom: 9px;

    &.is-user-member {
      margin-top: 9px;
    }
  }

  .go-back {
    display: flex;
    border: 1px solid ${royalPurpleColor};
    margin: 30px 0;
    padding: 26px 30px;
    border-radius: 10px;
    width: 100%;
    color: ${headerColor};
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    align-items: center;
    background-color: ${containerColor};

    svg {
      width: 16px;
      height: 16px;
      stroke: ${headerColor};
      margin-right: 8px;
    }
  }
`

export const CouncilOngoingActionStyled = styled(CardHover)<{ theme: MavrykTheme }>`
  width: 751px;
  padding: 0;
  margin-top: 0;
  margin-bottom: 10px;

  .top {
    padding: 15px 30px;
    height: 75px;
  }

  .bottom {
    padding: 20px 30px;
    border-top: 1px solid ${({ theme }) => theme.cardBorderColor};
  }

  .row {
    display: grid;
    grid-template-columns: 145px 205px 250px;
    grid-column-gap: 45px;

    &:nth-child(2) {
      margin-top: 20px;
    }
  }

  .top-row {
    grid-template-columns: 145px 245px 250px;
  }

  .two-columns {
    grid-template-columns: auto 250px;

    .column {
      .drop-btn {
        margin-top: 0;
      }
    }
  }

  .column {
    .column-name {
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;

      color: ${({ theme }) => theme.textColor}
    }

    .column-value {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;

      color: ${({ theme }) => theme.dataColor};
      text-transform: capitalize;
      text-overflow: ellipsis;
      max-width: inherit;
      overflow: hidden;
    }

    .column-image {
      height: 50px;
      width: 50px;
      object-fit: cover;
      border-radius: 50%;
    }

    .column-link {
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;

      color: ${({ theme }) => theme.topBarLinkColor};
      text-decoration: underline;
      text-overflow: ellipsis;
      max-width: inherit;
      overflow: hidden;

      cursor: pointer;
    }

    .column-address {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;

      color: ${({ theme }) => theme.dataColor};

      svg {
        stroke: ${({ theme }) => theme.dataColor};
        width: 20px;
      }
    }

    .drop-btn {
      margin-top: 14px;

      svg {
        margin-top: 2px;
        height: 18px;
        width: 18px;
      }
    }
  }
`

export const TabSwitcher = styled(TabSwitcherBase)`
  margin: 30px 0;
  width: 300px;
`
