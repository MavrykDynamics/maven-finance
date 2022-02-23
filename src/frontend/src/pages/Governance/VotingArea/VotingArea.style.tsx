import styled from 'styled-components/macro'

export const VotingAreaStyled = styled.div`
  display: flex;
  flex-direction: row;
  margin: 20px 0;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;

  > button {
    max-width: 40%;
  }
`

export const VotingButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  > button {
    width: 30%;
  }

  &.PROPOSAL {
    > button {
      width: 40%;
    }
  }
`
