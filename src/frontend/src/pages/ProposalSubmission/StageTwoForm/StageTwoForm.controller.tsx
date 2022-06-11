import { StageTwoFormView } from './StageTwoForm.view'
import { useDispatch } from 'react-redux'
import { useState } from 'react'
import {
  ProposalUpdateForm,
  ProposalUpdateFormInputStatus,
  ValidProposalUpdateForm,
} from '../../../utils/TypesAndInterfaces/Forms'
import { getFormErrors, isHexadecimalByteString, validateFormAndThrowErrors } from '../../../utils/validatorFunctions'
import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'
import { ERROR } from '../../../app/App.components/Toaster/Toaster.constants'
import { lockProposal, updateProposal } from '../ProposalSubmission.actions'

type StageTwoFormProps = {
  locked: boolean
  accountPkh?: string
}

export const PROPOSAL_BYTE = {
  id: 0,
  title: '',
  data: '',
}

export const StageTwoForm = ({ locked, accountPkh }: StageTwoFormProps) => {
  const dispatch = useDispatch()
  // TODO use from server
  const fee: number = 0.1
  const [form, setForm] = useState<ProposalUpdateForm>({
    title: 'Hello There',
    proposalId: 234,
    proposalBytes: [PROPOSAL_BYTE],
  })

  const [validForm, setValidForm] = useState<ValidProposalUpdateForm>({
    proposalBytes: false,
  })
  const [formInputStatus, setFormInputStatus] = useState<ProposalUpdateFormInputStatus>({
    proposalBytes: '',
  })

  const handleOnBlur = (index: number, text: string, type: string) => {
    const validityCheckResult = type === 'data' ? isHexadecimalByteString(text) : Boolean(text)

    // setValidForm({ ...validForm, proposalBytes: validityCheckResult })
    // const updatedState = { ...validForm, proposalBytes: validityCheckResult }
    // setFormInputStatus({ ...formInputStatus, proposalBytes: updatedState.proposalBytes ? 'success' : 'error' })
  }

  const handleUpdateProposal = () => {
    const formIsValid = validateFormAndThrowErrors(dispatch, validForm)
    if (true || formIsValid) dispatch(updateProposal(form, accountPkh as any))
  }

  const handleLockProposal = () => {
    console.log('Here in lock proposal')
    dispatch(lockProposal(form.proposalId, accountPkh as any))
  }

  return (
    <StageTwoFormView
      locked={locked}
      form={form}
      fee={fee}
      setForm={setForm}
      formInputStatus={formInputStatus}
      handleOnBlur={handleOnBlur}
      handleUpdateProposal={handleUpdateProposal}
      handleLockProposal={handleLockProposal}
    />
  )
}
