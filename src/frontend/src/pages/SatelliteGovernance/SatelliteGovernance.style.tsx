import styled from 'styled-components/macro'
import { Card, royalPurpleColor, containerColor, skyColor, cyanColor, headerColor } from 'styles'

export const SatelliteGovernanceStyled = styled.section`
  .satellite-governance-article {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding-top: 30px;
    margin-bottom: 0;
  }

  .tab-buttons {
    margin-bottom: 30px;
    width: 536px;
    justify-content: unset;

    button {
      width: 100%;
      height: 38px;
    }
  }

  textarea {
    height: 84px;
  }

  .suspend-satellite-group {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    padding-top: 40px;
  }

  .satellite-governance-info {
    border: 1px solid ${royalPurpleColor};
    border-radius: 10px;
    background-color: ${containerColor};
    padding: 24px 28px;

    h3 {
      font-weight: 600;
      font-size: 18px;
      line-height: 18px;
      color: ${skyColor};
      margin-top: 0;
      margin-bottom: 18px;
    }

    p {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 16px;
      line-height: 16px;
      color: ${cyanColor};
      margin-top: 0;
      margin-bottom: 0;

      a {
        position: static;
        width: 16px;
        height: 16px;
        margin-left: 8px;
      }
    }
  }
` // SatelliteGovernanceStyled

export const AvailableActionsStyle = styled(Card)`
  padding: 0;
  margin-bottom: 30px;

  h2 {
    font-weight: 600;
    font-size: 22px;
    line-height: 22px;
    color: ${headerColor};

    & + div {
      width: 450px;
      margin-right: 0;
    }
  }

  .dropdown-block {
    display: flex;
    border-bottom: 1px solid ${royalPurpleColor};
    padding: 16px 30px;
    align-items: center;
  }

  .satellite-address {
    margin-bottom: 19px;
  }

  .inputs-block {
    padding-top: 40px;
    padding-left: 30px;
    padding-right: 43px;
    padding-bottom: 23px;
    position: relative;

    button {
      width: 260px;
      margin-left: 64px;
      margin-bottom: 16px;

      svg {
        stroke: transparent;
      }
    }

    h1 {
      margin-top: 0;
      margin-bottom: 0;
    }

    p {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      color: ${skyColor};
      margin-top: 1px;
      margin-bottom: 17px;
    }

    label {
      font-weight: 700;
      font-size: 14px;
      line-height: 21px;
      color: ${headerColor};
      padding-left: 8px;
      padding-left: 8px;
      margin-bottom: 5px;
      display: block;
    }
  }
` // AvailableActionsStyle
