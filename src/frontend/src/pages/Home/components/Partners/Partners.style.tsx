import styled from 'styled-components/macro'
import { Page } from 'styles/components'

export const PartnersStyled = styled(Page)`
  margin-bottom: 150px;
`

export const PartnersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 40px;

  > a {
    position: relative;
    z-index: 1;
    text-align: center;

    > img {
      @media (max-width: 1000px) {
        width: 100%;
      }
    }
  }

  > a:before {
    width: 104px;
    height: 104px;
    left: calc(50% - 52px);
    top: calc(50% - 52px);
    content: '';
    background: #9cb8e2;
    opacity: 0.08;
    position: absolute;
    border-radius: 100%;
    z-index: -1;

    @media (max-width: 1000px) {
      width: 70px;
      height: 70px;
      left: calc(50% - 35px);
      top: calc(50% - 35px);
    }
  }

  @media (max-width: 1240px) {
    grid-template-columns: repeat(3, 1fr);

    div {
      display: none;
    }
  }

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, 1fr);
  }
`
