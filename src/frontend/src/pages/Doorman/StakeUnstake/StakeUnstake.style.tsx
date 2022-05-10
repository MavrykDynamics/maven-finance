import styled from 'styled-components/macro'
import { Card, CardHeader } from 'styles'

import { cianColor, downColor } from '../../../styles/colors'
import { MavrykTheme } from '../../../styles/interfaces'

export const StakeUnstakeStyled = styled.div`
  /* height: 240px; */
  position: relative;
  margin-top: 30px;
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  grid-gap: 30px;
`

export const StakeUnstakeCard = styled(Card)<{ theme: MavrykTheme }>`
  margin: 0;
  background-color: ${({ theme }) => theme.containerColor};
  border-radius: 10px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.subTextColor};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  min-width: 130px;
  padding-top: 25px;
`
export const StakeUnstakeActionCard = styled(Card)<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  border-radius: 10px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.subTextColor};
  margin: 0;
  padding-top: 40px;
  padding-bottom: 35px;
  padding-left: 55px;
  padding-right: 55px;
`
export const StakeUnstakeInputColumn = styled.div`
  display: flex;
  flex-direction: column;

  input {
    padding-right: 90px;
  }
`
export const StakeUnstakeInputLabels = styled.div`
  margin-bottom: 7px;
`
export const StakeUnstakeInputGrid = styled.div`
  display: grid;
  grid-template-columns: 62px auto;
  grid-gap: 7px;

  > img {
    margin-top: 15px;
  }

  > div {
    position: relative;
  }
`

export const StakeUnstakeMin = styled.div`
  color: ${({ theme }) => theme.headerSkyColor};
  font-size: 12px;
  font-weight: 600;
  float: left;
  display: inline-block;
  margin-left: 10px;
`

export const StakeUnstakeMax = styled.button<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.headerSkyColor};
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  float: right;
  display: inline-block;
  margin-right: 10px;
  text-decoration: underline;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: inherit;
`
export const StakeUnstakeErrorMessage = styled.div<{ inputOk: boolean; accountPkh?: string; theme: MavrykTheme }>`
  color: ${({ inputOk, theme }) => (inputOk ? theme.upColor : theme.downColor)};
  font-size: 12px;
  font-weight: 600;
`

export const StakeUnstakeInput = styled.input<{ theme: MavrykTheme }>`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.placeholderColor};
  margin: 10px 0;
  font-size: 22px;
  font-weight: 600;
  border: none;
  padding: 0 20px;
  border-radius: 10px;
  color: ${({ theme }) => theme.subTextColor};
  flex: 0 0 1;
  position: relative;
`

export const StakeUnstakeInputLabel = styled.div<{ theme: MavrykTheme }>`
  position: absolute;
  right: 17px;
  color: ${({ theme }) => theme.subTextColor};
  font-size: 22px;
  font-weight: 600;
`

export const StakeUnstakeRate = styled.div`
  font-size: 12px;
  font-weight: 600;
  align-self: end;
  display: inline-block;
  margin-right: 10px;
  color: ${({ theme }) => theme.headerSkyColor};
  margin-top: 5px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
`

export const StakeUnstakeButtonGrid = styled.div`
  margin: 25px auto 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
`

export const StakeUnstakeBalance = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  height: 100%;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.subTextColor};
  }
  img {
    margin: 26px auto;
    margin-top: auto;
  }

  p {
    font-size: 16px;
  }

  div {
    max-width: max-content;
    align-items: center;
    font-size: 20px;
    font-weight: 600;
    color: ${({ theme }) => theme.subTextColor};

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

export const StakeLabel = styled.blockquote`
  color: ${downColor};
  margin: 0;
  line-height: 19px;
  border: 1px solid ${downColor};
  font-weight: 400;
  font-size: 10px;
  border-radius: 10px;
  padding: 0 11px;
  margin-top: 14px;
`

export const StakeCompound = styled.button<{ theme: MavrykTheme }>`
  margin: 0;
  border: 1px solid ${cianColor};
  color: ${cianColor};
  font-weight: 400;
  font-size: 10px;
  line-height: 19px;
  height: 100%;
  margin-top: 15px;
  border-radius: 10px;
  background: none;
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 120px;
  padding-top: 12px;

  img {
    width: 90px;
  }
`
