import styled from 'styled-components/macro'
import { backgroundColor, backgroundTextColor, primaryColor, subTextColor, textColor } from 'styles'

export const TzAddressContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`
export const TzAddressStyled = styled.div`
  &.primary {
    color: ${primaryColor};
  }

  &.secondary {
    margin: 8px 8px 8px 0;
    color: ${subTextColor};
  }

  &.transparent {
    color: ${backgroundTextColor};
  }

  &.bold {
    font-weight: 600;
  }
`

export const TzAddressIcon = styled.svg`
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: sub;

  &.primary {
    stroke: ${backgroundColor};
  }

  &.secondary {
    stroke: ${subTextColor};
  }

  &.transparent {
    stroke: ${textColor};
  }
`
