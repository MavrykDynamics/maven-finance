import styled, { css } from 'styled-components/macro'
import { Card, cyanColor, headerColor, skyColor, darkPurpleColor } from 'styles'

export const TimeLeftAreaWrap = styled.div<{ showBorder: boolean }>`
  position: relative;
  ${({ showBorder }) =>
    showBorder
      ? css`
          &::before {
            content: '';
            width: 2px;
            height: 38px;
            top: 50%;
            transform: translateY(-50%);
            left: -15px;
            position: absolute;
            background-color: ${darkPurpleColor};
          }
        `
      : ''}
  padding-left: 15px;
  margin-left: auto;

  > div {
    font-size: 18px;
  }
`
