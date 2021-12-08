import styled from 'styled-components/macro'

import { primaryColor, textColor, backgroundColor, subTextColor } from '../../../styles'

export const ColoredLineStyled = styled.hr`
  opacity: 0.5;

  &.primary {
    color: ${primaryColor};
    background-color: ${backgroundColor};
  }

  &.secondary {
    color: ${primaryColor};
  }

  &.transparent {
    color: ${textColor};
    background-color: initial;
  }
`
