import styled from 'styled-components/macro'
import { containerColor } from 'styles'
import { MavrykTheme } from '../../styles/interfaces'

export const DoormanStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
`
