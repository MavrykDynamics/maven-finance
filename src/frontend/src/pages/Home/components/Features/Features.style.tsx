import styled from 'styled-components/macro'
import { containerColor, Page, primaryColor, subTextColor } from 'styles'

export const FeaturesStyled = styled(Page)`
  text-align: center;
  margin-bottom: 200px;
`

export const FeaturesGrid = styled.div`
  margin-top: 30px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
`

export const FeaturesComponent = styled.div`
  background-color: ${containerColor};
  border-radius: 10px;
  padding: 60px 30px;

  > img {
  }

  > div {
    margin-top: 30px;
    font-size: 24px;
    font-weight: bold;
    color: ${primaryColor};
  }

  > p {
    margin-top: 20px;
    font-size: 16px;
    color: ${subTextColor};
  }
`
