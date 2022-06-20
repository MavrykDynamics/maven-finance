import styled from 'styled-components/macro'
import {
  cyanColor,
  containerColor,
  royalPurpleColor,
  downColor,
  headerColor,
  skyColor,
  subTextColor,
  infoColor,
  upColor,
} from 'styles'

export const SatelliteDetailsStyled = styled.div`
  background-color: ${containerColor};
`

export const SatelliteDescriptionText = styled.p`
  font-size: 14px;
  color: ${subTextColor};
  font-weight: ${({ fontWeight }: { fontWeight: number }) => `${fontWeight}`};
  margin: 0;
`
export const SatelliteCardBottomRow = styled.div`
  display: flex;
  flex-direction: column;
  padding: 38px 25px;
  justify-content: center;
  font-weight: 400;
  font-size: 12px;
  line-height: 12px;
  color: ${headerColor};
  border-top: 1px solid ${royalPurpleColor};

  h4 {
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    color: ${headerColor};
  }

  p {
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    color: ${cyanColor};
  }

  .descr {
    padding-bottom: 4px;
    p {
      padding-top: 8px;
      padding-bottom: 8px;
    }
  }

  .satellite-info-block {
    margin-bottom: 38px;
  }

  .satellite-info-block-metrics {
    display: grid;
    grid-template-columns: 180px 100px;
    align-items: center;
    padding-top: 10px;

    p {
      margin-top: 7px;
      margin-bottom: 7px;
    }

    h5 {
      margin: 0;
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      color: ${skyColor};
    }
  }

  .satellite-voting-history {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding-top: 4px;

    b {
      font-weight: 700;
      font-size: 14px;

      &.voting-yes {
        color: ${upColor};
      }

      &.voting-no {
        color: ${downColor};
      }

      &.voting-abstain {
        color: ${skyColor};
      }
    }
  }

  .satellite-voting-history-info {
    flex-shrink: 0;
    padding-left: 16px;
  }

  .satellite-website {
    color: ${infoColor};
    font-weight: 700;
    font-size: 14px;
    line-height: 14px;
  }
` // SatelliteCardBottomRow
