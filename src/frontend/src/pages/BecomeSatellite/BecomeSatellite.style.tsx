import styled from 'styled-components/macro'
import { backgroundColor, borderColor, Card, containerColor, downColor, primaryColor, textColor, upColor } from 'styles'
import { MavrykTheme } from '../../styles/interfaces'

export const BecomeSatelliteStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
`

export const BecomeSatelliteForm = styled(Card)`
  padding-bottom: 80px;

  > h1 {
    margin: 0;
  }
  > p,
  > div > p {
    margin-top: 30px;
    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.textColor};
  }

  > button {
    width: 300px;
    float: right;
    margin: 0 0 0 10px;
  }
`

export const BecomeSatelliteFormTitle = styled.h1<{ theme: MavrykTheme }>`
  margin-top: 0;
  font-size: 25px;
  font-weight: bold;
  color: ${({ theme }) => theme.textColor};
`

export const BecomeSatelliteFormBalanceCheck = styled.div<{ balanceOk: boolean; theme: MavrykTheme }>`
  color: ${({ balanceOk, theme }) => (balanceOk ? theme.upColor : theme.downColor)};
`
export const BecomeSatelliteFormFeeCheck = styled.div<{ feeOk: boolean; theme: MavrykTheme }>`
  color: ${({ feeOk, theme }) => (feeOk ? theme.upColor : theme.downColor)};
`
export const UploaderFileSelector = styled.div<{ theme: MavrykTheme }>`
  margin: 15px 0;
  cursor: pointer;
  height: 100px;
  width: 100%;
  border: dashed ${({ theme }) => theme.borderColor};
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

export const UploadIconContainer = styled.div<{ theme: MavrykTheme }>`
  position: absolute;
  top: 15%;
  left: 47.5%;
  text-align: center;

  > div {
    font-size: 14px;
    font-weight: 400;
    color: ${({ theme }) => theme.textColor};
  }
`
export const UploadIcon = styled.svg<{ theme: MavrykTheme }>`
  stroke: ${({ theme }) => theme.primaryColor};
  width: 37px;
  height: 37px;

  > use {
    overflow: visible;
  }
  &.primary {
    stroke: ${({ theme }) => theme.backgroundColor};
  }

  &.secondary {
    stroke: ${({ theme }) => theme.primaryColor};
  }

  &.transparent {
    stroke: ${({ theme }) => theme.textColor};
  }
`
export const BecomeSatelliteProfilePic = styled.div`
  margin: 30px 0 15px;
  min-height: 200px;
  > img {
    height: 100%;
  }
`
