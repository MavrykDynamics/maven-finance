import styled from 'styled-components/macro'
import { Card, headerColor, cianColor } from 'styles'

export const SatellitePaginationStyled = styled(Card)`
  margin-top: 0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  padding-left: 24px;
  padding-right: 24px;

  .pagination-link {
    display: flex;
    color: ${headerColor};
    align-items: center;
    min-height: 23px;
    stroke: ${headerColor};
    font-weight: 400;
    font-size: 14px;

    svg {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }

    &:hover {
      color: ${cianColor};
      stroke: ${cianColor};
    }

    &.back {
      margin-right: auto;
    }

    &.prev {
      margin-left: auto;
    }

    &.next {
      margin-left: 35px;

      svg {
        transform: rotate(180deg);
        margin-left: 8px;
        margin-right: auto;
      }
    }
  }
` //SatellitePaginationStyled
