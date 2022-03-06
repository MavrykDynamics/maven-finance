import { StageTwoFormView } from './StageTwoForm.view'
import { useDispatch } from 'react-redux'
import { useState } from 'react'
import {
  ProposalUpdateForm,
  ProposalUpdateFormInputStatus,
  ValidProposalUpdateForm,
} from '../../../utils/TypesAndInterfaces/Forms'
import { getFormErrors, isHexadecimalByteString } from '../../../utils/validatorFunctions'
import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'
import { ERROR } from '../../../app/App.components/Toaster/Toaster.constants'
import { lockProposal, updateProposal } from '../ProposalSubmission.actions'

type StageTwoFormProps = {
  loading: boolean
  accountPkh?: string
}
export const StageTwoForm = ({ loading, accountPkh }: StageTwoFormProps) => {
  const dispatch = useDispatch()
  const [form, setForm] = useState<ProposalUpdateForm>({
    title: 'Hello There',
    proposalId: 234,
    proposalBytes: '',
  })
  const [validForm, setValidForm] = useState<ValidProposalUpdateForm>({
    proposalBytes: false,
  })
  const [formInputStatus, setFormInputStatus] = useState<ProposalUpdateFormInputStatus>({
    proposalBytes: '',
  })

  const handleOnBlur = () => {
    const validityCheckResult = isHexadecimalByteString(form.proposalBytes)
    setValidForm({ ...validForm, proposalBytes: validityCheckResult })
    const updatedState = { ...validForm, proposalBytes: validityCheckResult }
    setFormInputStatus({ ...formInputStatus, proposalBytes: updatedState.proposalBytes ? 'success' : 'error' })
  }

  const handleUpdateProposal = () => {
    const formIsValid = validateForm()
    if (formIsValid) dispatch(updateProposal(form, accountPkh as any))
  }

  const handleLockProposal = () => {
    console.log('Here in lock proposal')
    dispatch(lockProposal(form.proposalId, accountPkh as any))
  }

  const validateForm = () => {
    const { errors, errorMessage } = getFormErrors(validForm)
    if (errors.length === 0) return true
    else {
      const errorTitle = 'Invalid fields'
      dispatch(showToaster(ERROR, errorTitle, errorMessage, 3000))
      return false
    }
  }
  return (
    <StageTwoFormView
      loading={loading}
      form={form}
      setForm={setForm}
      formInputStatus={formInputStatus}
      handleOnBlur={handleOnBlur}
      handleUpdateProposal={handleUpdateProposal}
      handleLockProposal={handleLockProposal}
    />
  )
}
