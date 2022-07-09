import { StageTwoFormView } from './StageTwoForm.view'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
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
  proposalId: number | undefined
  proposalTitle: string
}

export const PROPOSAL_BYTE = {
  id: 0,
  title: '',
  data: '',
}

export const StageTwoForm = ({ locked, accountPkh, proposalTitle, proposalId }: StageTwoFormProps) => {
  const dispatch = useDispatch()
  const { governanceStorage } = useSelector((state: State) => state.governance)
  const { fee, address } = governanceStorage
  const successReward = governanceStorage.config.successReward
  const [form, setForm] = useState<ProposalUpdateForm>({
    title: proposalTitle,
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

    setValidForm({ ...validForm, proposalBytes: validityCheckResult })
    const updatedState = { ...validForm, proposalBytes: validityCheckResult }
    setFormInputStatus({ ...formInputStatus, proposalBytes: updatedState.proposalBytes ? 'success' : 'error' })
  }

  const handleUpdateProposal = async () => {
    const formIsValid = validateFormAndThrowErrors(dispatch, validForm)
    if (formIsValid) {
      await dispatch(updateProposal(form, proposalId, accountPkh as any))
    }
  }

  return (
    <StageTwoFormView
      locked={locked}
      form={form}
      fee={fee}
      proposalId={proposalId}
      successReward={successReward}
      setForm={setForm}
      formInputStatus={formInputStatus}
      handleOnBlur={handleOnBlur}
      handleUpdateProposal={handleUpdateProposal}
    />
  )
}
