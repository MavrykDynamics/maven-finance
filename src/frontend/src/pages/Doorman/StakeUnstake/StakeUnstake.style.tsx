import styled from 'styled-components/macro'
import { backgroundColor, downColor, placeholderColor, subTextColor, upColor } from 'styles'

export const StakeUnstakeStyled = styled.div`
  /* height: 240px; */
  position: relative;
  margin-top: 30px;
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  grid-gap: 30px;
`

export const StakeUnstakeCard = styled.div`
  background-color: ${backgroundColor};
  border-radius: 10px;
  padding: 35px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: ${subTextColor};
`
export const StakeUnstakeInputColumn = styled.div`
  display: flex;
  flex-direction: column;
`
export const StakeUnstakeInputGrid = styled.div`
  display: grid;
  grid-template-columns: 62px auto;
  grid-gap: 50px;

  > img {
    margin: 10px;
  }

  > div {
    position: relative;
  }
`

export const StakeUnstakeMin = styled.div`
  font-size: 12px;
  font-weight: 600;
  float: left;
  display: inline-block;
  margin-left: 10px;
`

export const StakeUnstakeMax = styled.button`
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  float: right;
  display: inline-block;
  margin-right: 10px;
  text-decoration: underline;
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: inherit;
`
export const StakeUnstakeInputCheck = styled.div<{ inputOk: boolean; accountPkh?: string }>`
  height: 50px;
  width: 100%;
  border: 1px;
  border-style: ${({ inputOk, accountPkh }) => (inputOk ? (accountPkh ? 'solid' : 'hidden') : 'solid')};
  border-color: ${({ inputOk, accountPkh }) => (accountPkh ? (inputOk ? upColor : downColor) : 'none')};
  margin: 10px 0;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`
export const StakeUnstakeErrorMessage = styled.div<{ inputOk: boolean; accountPkh?: string }>`
  color: ${({ inputOk }) => (inputOk ? upColor : downColor)};
  font-size: 12ípx;
  font-weight: 600;
`

export const StakeUnstakeInput = styled.input`
  width: 100%;
  height: 100%;
  background: ${placeholderColor};
  margin: 10px 0;
  font-size: 22px;
  font-weight: 600;
  border: none;
  padding: 0 20px;
  border-radius: 10px;
  color: ${subTextColor};
  -webkit-appearance: none;
  appearance: none;
`

export const StakeUnstakeInputLabel = styled.div`
  position: absolute;
  top: 36px;
  right: 17px;
  color: ${subTextColor};
  font-size: 22px;
  font-weight: 600;
`

export const StakeUnstakeRate = styled.div`
  font-size: 12px;
  font-weight: 600;
  align-self: end;
  display: inline-block;
  margin-right: 10px;
`

export const StakeUnstakeButtonGrid = styled.div`
  margin: 30px auto 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 30px;
`

export const StakeUnstakeBalance = styled.div`
  h3 {
    font-size: 14px;
    font-weight: 600;
    color: ${subTextColor};
  }

  img {
    margin: 26px auto;
  }

  div {
    font-size: 20px;
    font-weight: 600;
    color: ${subTextColor};

    &::after {
      content: '';
      display: block;
      width: 50px;
      height: 3px;
      background-color: #7068aa;
      margin: 10px auto;
    }
  }
`
