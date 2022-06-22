import styled from 'styled-components/macro'
import { downColor, upColor, skyColor, headerColor, royalPurpleColor } from '../../styles/colors'

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
`
