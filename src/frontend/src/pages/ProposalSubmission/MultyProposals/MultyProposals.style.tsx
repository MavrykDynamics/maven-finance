import styled from 'styled-components'
import { Card } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const MultyProposalsStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  column-gap: 15px;
  margin-top: 30px;
  margin-bottom: -10px;

  .multyProposalsSwitcher {
    max-width: 65%;
  }

  > button {
    max-width: 25%;
  }
`
