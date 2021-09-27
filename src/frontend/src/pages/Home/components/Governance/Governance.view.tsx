import * as React from 'react'

import { GovernanceContent, GovernanceImage, GovernanceStyled } from './Governance.style'

export const GovernanceView = () => {
  return (
    <GovernanceStyled>
      <GovernanceContent>
        <h1>Cycle of Governance & Oracle</h1>
        <GovernanceImage />
      </GovernanceContent>
    </GovernanceStyled>
  )
}
