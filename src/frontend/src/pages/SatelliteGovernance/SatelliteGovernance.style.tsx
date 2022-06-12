import styled from 'styled-components/macro'
import { Card, royalPurpleColor } from 'styles'

export const SatelliteGovernanceStyled = styled.section`
  .satellite-governance-article {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding-top: 30px;
    margin-bottom: 22px;
  }
` // SatelliteGovernanceStyled

export const AvailableActionsStyle = styled(Card)`
  padding: 0;

  .dropdown-block {
    display: flex;
    border-bottom: 1px solid ${royalPurpleColor};
    padding: 20px 30px;
  }

  .inputs-block {
    padding-top: 40px;
    padding-left: 30px;
    padding-right: 43px;
    padding-bottom: 25px;

    h1 {
      margin-top: 0;
    }
  }
` // AvailableActionsStyle
