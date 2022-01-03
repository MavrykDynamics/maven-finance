import styled from 'styled-components/macro'
import { backgroundColor, borderColor, Card, containerColor, downColor, primaryColor, textColor, upColor } from 'styles'

export const BecomeSatelliteStyled = styled.div`
  background-color: ${containerColor};
`

export const BecomeSatelliteForm = styled(Card)`
  padding-bottom: 80px;

  > p {
    margin-top: 30px;
  }

  > button {
    width: 300px;
    float: right;
  }
`

export const BecomeSatelliteFormBalanceCheck = styled.div<{ balanceOk: boolean }>`
  color: ${(props) => (props.balanceOk ? upColor : downColor)};
`
export const BecomeSatelliteFormFeeCheck = styled.div<{ feeOk: boolean }>`
  color: ${(props) => (props.feeOk ? upColor : downColor)};
`
export const UploaderFileSelector = styled.div`
  margin: 15px 0;
  cursor: pointer;
  height: 100px;
  width: 100%;
  border: dashed ${borderColor};
  display: inline-block;
  border-radius: 10px;
  border-width: 2px;

  > div {
    width: 100%;
    height: 100%;
    position: relative;
  }
  > div > input {
    all: unset;
    display: inline-block;
    border-radius: 10px;
    outline: none;
    width: 100%;
    height: 100%;
    appearance: initial;
    opacity: 0;
    position: relative;
    -webkit-appearance: none;
  }
`

export const UploadIconContainer = styled.div`
  position: absolute;
  top: 15%;
  left: 47.5%;
  text-align: center;

  > div {
    font-size: 14px;
    font-weight: 400;
    color: ${textColor};
  }
`
export const UploadIcon = styled.svg`
  stroke: ${primaryColor};
  width: 37px;
  height: 37px;

  > use {
    overflow: visible;
  }
  &.primary {
    stroke: ${backgroundColor};
  }

  &.secondary {
    stroke: ${primaryColor};
  }

  &.transparent {
    stroke: ${textColor};
  }
`
export const BecomeSatelliteProfilePic = styled.div`
  margin: 30px 0 15px;
  min-height: 200px;
  > img {
    height: 100%;
  }
`
