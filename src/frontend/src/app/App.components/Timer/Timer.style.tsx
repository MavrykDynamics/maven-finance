import styled from 'styled-components/macro'

export const TimerStyled = styled.div<{ negativeColor: string; defaultColor: string }>`
  margin: 0;

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    display: inline-block;
    list-style-type: none;
    padding-right: 5px;

    color: ${({ defaultColor }) => defaultColor};

    &.negative {
      color: ${({ negativeColor }) => negativeColor};
    }
  }

  li span {
    display: block;
  }
`
