import styled from 'styled-components/macro'
import { Card } from 'styles'

import { cyanColor, headerColor, upColor } from '../../styles/colors'
import { MavrykTheme } from '../../styles/interfaces'

export const BecomeSatelliteStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
`

export const BecomeSatelliteForm = styled(Card)`
  padding-bottom: 53px;
  margin-top: 0;
  padding-top: 28px;

  > h1 {
    margin: 0;
    color: ${headerColor};
    padding-bottom: 26px;
  }

  input.success,
  input.error {
    border-color: ${({ theme }) => theme.cardBorderColor};
  }

  label,
  .label {
    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.headerColor};
    margin-bottom: 10px;
    display: block;

    p {
      margin: 0;
    }
  }

  #textAreaContainer {
    margin-bottom: 18px;
  }

  .input-fee-wrap {
    width: 163px;
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
  display: flex;
  padding-bottom: 20px;

  p {
    margin: 0;
  }

  svg {
    stroke: ${({ balanceOk, theme }) => (balanceOk ? theme.upColor : theme.downColor)};
    width: 12px;
    height: 12px;
    margin-right: 8px;
  }
`
export const BecomeSatelliteFormFeeCheck = styled.div<{ feeOk: boolean; theme: MavrykTheme }>`
  color: ${({ feeOk, theme }) => (feeOk ? theme.upColor : theme.downColor)};
`
export const UploaderFileSelector = styled.div<{ theme: MavrykTheme }>`
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
    stroke: ${({ theme }) => theme.containerColor};
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
export const BecomeSatelliteFormHorizontal = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 33px;
  padding-bottom: 19px;
`
export const BecomeSatelliteButttons = styled.div`
  display: flex;
  padding-top: 40px;
  justify-content: flex-end;

  button {
    width: 255px;
    margin-left: 40px;
  }
`
