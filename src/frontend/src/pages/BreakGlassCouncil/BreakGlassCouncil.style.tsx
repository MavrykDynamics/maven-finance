import styled from 'styled-components/macro'
import { Page as PageBase, Card, CardHover, textsColor, headerColor, skyColor } from 'styles'

// components
import ModalPopupBase from '../../app/App.components/Modal/ModalPopup.view'
import { TabSwitcher as TabSwitcherBase } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

// types
import { MavrykTheme } from '../../styles/interfaces'

export const Page = styled(PageBase)`
  & > h1 {
    margin-bottom: 11px;
  }
`

export const BreakGlassCouncilStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;

  .left-block {
    width: 750px;

    & > h1 {
      margin-bottom: 11px;
    }

    .pending {
      display: flex;
      width: 100%;
      justify-content: space-between;
    }

    .pending-items {
      width: 750px;
    }
  }

  .right-block {
    width: 310px;

    & > h1 {
      margin-top: 30px;
      margin-bottom: 10px;
    }
  }
`

export const PropagateBreakGlassCouncilCard = styled(Card)<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 0 30px;
  height: 75px;

  h1 {
    margin: 0;

    &::after {
      display: none;
    }
  }

  button {
    max-width: 250px;

    &.start_verification {
      svg {
        stroke-width: 0.1;
        fill: ${textsColor};
      }
    }
  }
`

export const ReviewPastCouncilActionsCard = styled(Card)<{
  displayPendingSignature: boolean
  theme: MavrykTheme
}>`
  padding: 60px 30px 30px 30px;
  margin-top: ${({ displayPendingSignature }) => (displayPendingSignature ? 0 : 30)}px;
  margin-bottom: 23px;
  height: 201px;

  h2 {
    text-align: center;
    margin-bottom: 42px;
    font-weight: 600;
    font-size: 16px;
    line-height: 16px;
    color: ${skyColor};
  }
`

export const GoBack = styled(Card)`
  display: flex;
  align-items: center;
  padding: 0 26px;
  height: 75px;

  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  color: ${headerColor};
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
    stroke: ${headerColor};
    margin-right: 8px;
  }
`

export const AvaliableActions = styled(Card)<{ theme: MavrykTheme }>`
  padding: 0;

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px 0 30px;
    height: 75px;
  }

  .top-bar-title {
    margin: 0;

    font-weight: 600;
    font-size: 22px;
    line-height: 22px;

    &::after {
      display: none;
    }
  }

  .dropdown-size {
    width: 440px;
  }
`

export const BreakGlassCouncilMyOngoingActionCardStyled = styled(CardHover)<{ theme: MavrykTheme }>`
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

export const ModalPopup = styled(ModalPopupBase)`
  padding: 0;
`

export const TabSwitcher = styled(TabSwitcherBase)`
  margin: 30px 0;
  width: 300px;
`
