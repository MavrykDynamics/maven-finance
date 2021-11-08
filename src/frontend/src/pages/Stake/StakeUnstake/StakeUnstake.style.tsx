import styled from 'styled-components/macro'
import { backgroundColor, placeholderColor, subTextColor } from 'styles'

export const StakeUnstakeStyled = styled.div`
  height: 240px;
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

export const StakeUnstakeMax = styled.div`
  font-size: 12px;
  font-weight: 600;
  float: right;
  display: inline-block;
  margin-right: 10px;
  text-decoration: underline;
`

export const StakeUnstakeInput = styled.input`
  width: 100%;
  height: 50px;
  background: ${placeholderColor};
  border-radius: 10px;
  font-size: 22px;
  font-weight: 600;
  border: none;
  margin: 10px 0;
  padding: 0 20px;
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
  float: right;
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
