import styled, { css } from 'styled-components/macro'
import { Card, cyanColor, headerColor, skyColor, darkPurpleColor } from 'styles'

export const TimeLeftAreaWrap = styled.div<{ showBorder: boolean }>`
  ${({ showBorder }) =>
    showBorder
      ? css`
          border-left: 2px solid ${darkPurpleColor};
        `
      : ''}
  padding-left: 15px;
  margin-left: auto;

  > div {
    font-size: 18px;
  }
`
