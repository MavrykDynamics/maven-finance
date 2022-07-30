import styled from 'styled-components/macro'
import { Card, cyanColor, headerColor, skyColor, darkPurpleColor } from 'styles'

export const TimeLeftAreaWrap = styled.div`
  border-left: 2px solid ${darkPurpleColor};
  display: flex;
  height: 38px;
  flex-shrink: 0;
  align-items: center;
  min-width: 189px;
  text-align: right;
  justify-content: flex-end;
`

export const TimeLeftArea = styled.div`
  color: ${skyColor};
  font-weight: 600;
  font-size: 16px;
  line-height: 16px;
  margin-left: 32px;
`
