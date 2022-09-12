import React, { FC } from 'react'

// components
import { FormSetAllContractsAdminView } from './FormSetAllContractsAdmin.view'
import { breakGlassActions } from "../BreakGlassActions.actions"

// styles
import { BreakGlassActionsFormsWrapper as BreakGlassActionsFormWrapper } from './BreakGlassActionsForm.style'

type Props = {
  action?: string;
}

export const BreakGlassActionsForms: FC<Props> = ({ action }) => {
  return (
    <BreakGlassActionsFormWrapper>
      {breakGlassActions.SET_ALL_CONTRACTS_ADMIN === action ? <FormSetAllContractsAdminView /> : null}
    </BreakGlassActionsFormWrapper>
  )
}
