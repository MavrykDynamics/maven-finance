import * as React from 'react'

import { GovernanceContent, GovernanceStyled } from './Governance.style'

export const GovernanceView = () => {
  return (
    <GovernanceStyled>
      <GovernanceContent>
        <h1>Cycle of Governance & Oracle</h1>
        <img alt="governance" src="/images/governance-cycle.svg" />
      </GovernanceContent>
    </GovernanceStyled>
  )
}
