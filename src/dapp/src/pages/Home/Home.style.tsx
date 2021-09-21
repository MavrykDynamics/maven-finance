import styled, { keyframes } from 'styled-components/macro'
import { Page } from 'styles'

export const HomeStyled = styled(Page)`
  text-align: center;
`

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

export const HomeTitle = styled.div`
  width: 100%;
  text-align: center;
  margin: 100px auto 0px auto;
  font-size: 80px;
  font-weight: bold;
  background-image: url('/images/gradiant.png');
  -webkit-background-clip: text;
  background-clip: text;
  background-size: 300% 300%;
  -webkit-text-fill-color: transparent;
  animation: ${gradiant} 30s ease-in-out infinite;
`

export const HomeButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;
  width: 600px;
  max-width: 80vw;
  margin: auto;
`
