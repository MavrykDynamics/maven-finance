import React, { FC } from 'react'

// components
import { FormSetAllContractsAdminView } from './FormSetAllContractsAdmin.view'

// styles
import { BreakGlassActionsFormsWrapper as BreakGlassActionsFormWrapper } from './BreakGlassActionsForm.style'

type Props = {
  action?: string;
}

export const BreakGlassActionsForms: FC<Props> = ({ action }) => {
  return (
    <BreakGlassActionsFormWrapper>
      <FormSetAllContractsAdminView />
    </BreakGlassActionsFormWrapper>
  )
}
