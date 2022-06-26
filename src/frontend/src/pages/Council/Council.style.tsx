import styled from 'styled-components/macro'
import { downColor, upColor, skyColor, headerColor, royalPurpleColor, containerColor } from 'styles'

export const CouncilStyled = styled.section`
  .pending {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 30px;
  }

  .pending-items {
    width: 100%;
    display: flex;
    gap: 20px;
    max-width: 750px;
    overflow: auto;
  }

  h1 {
    margin-top: 29px;
    margin-bottom: 11px;
  }

  .council-details {
    display: flex;
    padding-top: 30px;

    &.is-user-member {
      padding-top: 0;
    }
  }

  .council-members {
    width: 309px;
    margin-left: 30px;
    flex-shrink: 0;

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
    margin-top: 30px;
    padding: 26px 30px;
    border-radius: 10px;
    width: 100%;
    margin-bottom: 26px;
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
