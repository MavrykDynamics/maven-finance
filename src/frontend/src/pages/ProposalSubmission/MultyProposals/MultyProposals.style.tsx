import styled from 'styled-components'
import { Card } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const MultyProposalsStyled = styled(Card)<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px 12px 15px;

  .empty-proposals {
    color: #8d86eb;
    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
  }

  .multyProposalsSwitcher {
    max-width: 65%;
  }

  > button {
    max-width: 25%;
  }
`
