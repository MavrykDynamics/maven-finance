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
    margin-top: 30px;
    margin-bottom: 20px;
  }
`
