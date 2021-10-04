import styled, { css, keyframes } from 'styled-components/macro'
import { backgroundColor, subTextColor } from 'styles'

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
  padding: 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: ${subTextColor};
`
