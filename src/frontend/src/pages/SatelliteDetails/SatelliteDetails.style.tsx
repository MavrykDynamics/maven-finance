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

  .column-wrapper {
    display: flex;
    justify-content: space-between;
    column-gap: 130px;
    align-items: center;
  }

  p {
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    color: ${cyanColor};
  }
`

export const BlockName = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 14px;
  color: ${headerColor};
`

export const SatelliteMetricsBlock = styled.div`
  display: grid;
  grid-template-columns: 200px 60px;
  align-items: center;
  padding-top: 10px;

  p {
    margin-top: 7px;
    margin-bottom: 7px;
    text-align: right;
  }

  h5 {
    margin: 0;
    font-weight: 400;
    font-size: 15px;
    line-height: 16px;
    color: ${skyColor};
  }
`

export const SatelliteVotingInfoWrapper = styled.div`
  width: 100%;

  .voting-info-list-wrapper {
    max-height: 110px;
    overflow-y: scroll;
    padding-right: 10px;
  }
`

export const SatelliteDescrBlock = styled.div`
  margin-bottom: 25px;

  p {
    padding-top: 8px;
    margin-bottom: 25px;
    font-size: 15px;
  }

  .satellite-website {
    color: ${infoColor};
    font-weight: 700;
    font-size: 14px;
    line-height: 14px;
  }
`

export const SatelliteVotingHistoryListItem = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-top: 4px;

  .satellite-voting-history-info {
    flex-shrink: 0;
    padding-left: 16px;
    color: ${skyColor};
  }

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
`
