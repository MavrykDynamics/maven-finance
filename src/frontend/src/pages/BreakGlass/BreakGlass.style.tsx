import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

export const BreakGlassStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  margin-top: 15px;
  display: flex;
  width: 100%;
  flex-direction: row;
`
