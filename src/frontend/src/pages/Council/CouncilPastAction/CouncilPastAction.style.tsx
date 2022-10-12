import styled from 'styled-components/macro'
import { CardHover, downColor, upColor, skyColor, headerColor, cyanColor } from 'styles'

export const CouncilPastActionStyled = styled(CardHover)`
  margin: 0;
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: 190px 250px auto 70px;
  align-items: center;
  padding-top: 17px;
  padding-block: 18px;
  padding-left: 39px;
  padding-right: 28px;

  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: ${skyColor};
    margin-top: 0;
    margin-bottom: 2px;
  }

  h4 {
    font-weight: 700;
    font-size: 14px;
    line-height: 14px;
    color: ${cyanColor};

    &::first-letter {
      text-transform: uppercase;
    }
  }

  figure {
    margin: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    svg {
      fill: none;
      stroke: ${headerColor};
      width: 16px;
      height: 16px;
    }

    .icon-send {
      &:hover {
        svg {
          stroke: ${cyanColor};
        }
      }
    }
  }

  .is-green {
    color: ${upColor};
  }

  .is-red {
    color: ${downColor};
  }
`
