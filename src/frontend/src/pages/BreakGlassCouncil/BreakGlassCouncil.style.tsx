import styled from "styled-components/macro"
import { Page as PageBase, Card, royalPurpleColor, textsColor, headerColor, skyColor } from "styles"
import ModalPopupBase from '../../app/App.components/Modal/ModalPopup.view'

import { MavrykTheme } from "../../styles/interfaces";

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

export const ReviewPastCouncilActionsCard = styled(Card)<{ 
  displayPendingSignature: boolean
  theme: MavrykTheme
}>`
  padding: 60px 30px 30px 30px;
  margin-top: ${({displayPendingSignature}) => displayPendingSignature ? 0 : 30}px;
  margin-bottom: 23px;
  height: 201px;

  h2 {
    text-align: center;
    margin-bottom: 42px;
    font-weight: 600;
    font-size: 16px;
    line-height: 16px;
    color: ${skyColor}
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

    border-bottom: 1px solid ${royalPurpleColor};
  }

  .top-bar-title {
    margin: 0;

    font-weight: 600;
    font-size: 22px;
    line-height: 22px;

    &::after{
      display: none;
    }
  }

  .dropdown-size {
    width: 440px;
  }
`

export const ModalPopup = styled(ModalPopupBase)`
  padding: 0;
`
