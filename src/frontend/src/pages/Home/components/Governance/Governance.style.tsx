import styled from 'styled-components/macro'
import { backgroundColor, Page } from 'styles'

export const GovernanceStyled = styled.div`
  background: url('./images/governance-bg.svg'), radial-gradient(65.55% 65.55% at 50% 40.11%, #60558b 0%, #53487f 100%);
  background-repeat: no-repeat;
  background-position: bottom right;
  margin-bottom: 100px;
  padding: 50px 0;
`

export const GovernanceContent = styled(Page)`
  > h1 {
    color: ${backgroundColor};
  }

  > img {
    margin: 20px auto 100px auto;
    display: block;
  }
`
