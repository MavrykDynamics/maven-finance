import styled from 'styled-components/macro'
import { skyColor } from 'styles'

export const MoveNextRoundModalstyle = styled.div`
  h1 {
    font-size: 25px;
    font-weight: 700;
  }

  p {
    font-weight: 400;
    font-size: 18px;
    line-height: 27px;
    color: ${skyColor};
    text-align: center;
    padding: 0 32px;
    margin-top: 27px;
    margin-bottom: 67px;
  }

  .btn-group {
    display: flex;
    justify-content: center;
    margin-bottom: 27px;

    button {
      margin: 0 5px;
      width: 220px;
    }
  }
`
