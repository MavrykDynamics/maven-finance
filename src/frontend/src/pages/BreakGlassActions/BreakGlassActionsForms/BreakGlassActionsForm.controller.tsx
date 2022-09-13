import React, { FC } from 'react'

// components
import { FormSetAllContractsAdminView } from './FormSetAllContractsAdmin.view'
import { FormSetSingleContractAdminView } from './FormSetSingleContractAdmin.view'
import { FormSignActionView } from './FormSignAction.view'
import { FormAddCouncilMemberView } from './FormAddCouncilMember.view'
import { FormUpdateCouncilMemberView } from './FormUpdateCouncilMember.view'
import { FormChangeCouncilMemberView } from './FormChangeCouncilMember.view'
import { FormRemoveCouncilMemberView } from './FormRemoveCouncilMember.view'
import { breakGlassActions } from "../BreakGlassActions.actions"

type Props = {
  action?: string;
}

export const BreakGlassActionsForm: FC<Props> = ({ action }) => {
  return (
    <>
      {breakGlassActions.SET_ALL_CONTRACTS_ADMIN === action ? <FormSetAllContractsAdminView /> : null}
      {breakGlassActions.SET_SINGLE_CONTRACT_ADMIN === action ? <FormSetSingleContractAdminView /> : null}
      {breakGlassActions.SIGN_ACTION === action ? <FormSignActionView /> : null}
      {breakGlassActions.ADD_COUNCIL_MEMBER === action ? <FormAddCouncilMemberView /> : null}
      {breakGlassActions.UPDATE_COUNCIL_MEMBER === action ? <FormUpdateCouncilMemberView /> : null}
      {breakGlassActions.CHANGE_COUNCIL_MEMBER === action ? <FormChangeCouncilMemberView /> : null}
      {breakGlassActions.REMOVE_COUNCIL_MEMBER === action ? <FormRemoveCouncilMemberView /> : null}    </>
  )
}
