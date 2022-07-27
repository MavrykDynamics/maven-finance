import styled from 'styled-components/macro'
import { royalPurpleColor, containerColor, skyColor, cyanColor } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const InfoTabStyled = styled.div<{ theme: MavrykTheme }>`
  border: 1px solid ${royalPurpleColor};
  border-radius: 10px;
  background-color: ${containerColor};
  padding: 26px 20px;

  h3 {
    font-weight: 600;
    font-size: 16px;
    line-height: 18px;
    color: ${skyColor};
    margin-top: 0;
    margin-bottom: 20px;
  }

  p {
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    color: ${cyanColor};
    margin-top: 0;
    margin-bottom: 0;

    a {
      position: static;
      width: 16px;
      height: 16px;
      margin-left: 8px;
    }
  }
`
