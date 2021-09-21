import styled, { keyframes } from 'styled-components/macro'
import { backgroundColor, Page, primaryColor } from 'styles'

export const CreateStyled = styled(Page)``

const gradiant = keyframes`
    0% {
        background-position: 0% 0%;
    }
    50% {
        background-position: 100% 100%;
    }
    100% {
        background-position: 0% 0%;
    }
`

export const CreateTitle = styled.div`
  width: 100%;
  text-align: center;
  margin: 100px auto 10px auto;
  font-size: 80px;
  font-weight: bold;
  background-image: url('/images/gradiant.png');
  -webkit-background-clip: text;
  background-clip: text;
  background-size: 300% 300%;
  -webkit-text-fill-color: transparent;
  animation: ${gradiant} 30s ease-in-out infinite;
`

export const CreateSubTitle = styled.div`
  font-weight: bold;
  font-size: 44px;
  line-height: 44px;
  text-align: center;
  letter-spacing: -0.03em;
`

export const CreateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 100px;
  width: 1100px;
  max-width: 80vw;
  margin: 70px auto;
`

export const CreateGridCell = styled.div`
  width: 500px;
  background-color: ${primaryColor};
  border-radius: 10px;
  text-align: center;

  > svg {
    width: 200px;
    height: 200px;
    margin: 70px auto 0 auto;
    display: block;
  }

  button {
    width: 140px;
    margin: 90px auto 70px auto;
  }

  > div {
    color: ${backgroundColor};
  }
`

export const CreateGridCellTitle = styled.div`
  font-weight: bold;
  font-size: 50px;
  line-height: 50px;
  text-align: center;
  color: ${backgroundColor};
  margin: 40px auto 0 auto;
`
