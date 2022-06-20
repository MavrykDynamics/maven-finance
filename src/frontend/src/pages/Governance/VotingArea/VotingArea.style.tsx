import styled from 'styled-components/macro'
import { cyanColor } from 'styles'

export const VotingAreaStyled = styled.article`
  display: flex;
  flex-direction: row;
  margin: 20px 0;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-bottom: 48px;

  > button {
    max-width: 40%;
  }

  .voted-block {
    display: flex;
    align-items: center;
    padding-top: 30px;
    width: 100%;

    button {
      width: 194px;
      margin-left: auto;
      margin-right: 0;
    }
  }

  .voted-label {
    color: ${cyanColor};
    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
  }
`

export const VotingButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  padding-top: 26px;

  > button {
    width: 29%;
  }

  &.PROPOSAL {
    > button {
      width: 40%;
    }
  }
`
