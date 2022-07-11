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
    title: false,
    proposalBytes: false,
  })
  const [formInputStatus, setFormInputStatus] = useState<ProposalUpdateFormInputStatus>({
    title: '',
    proposalBytes: '',
  })

  const handleOnBlur = (index: number, text: string, type: string) => {
    const validityCheckResultData = Boolean(text)
    const validityCheckResultText = Boolean(text)

    if (type === 'title') {
      setValidForm({ ...validForm, title: validityCheckResultText })
      const updatedState = { ...validForm, title: validityCheckResultText }
      setFormInputStatus({ ...formInputStatus, title: updatedState.title ? 'success' : 'error' })
    }

    if (type === 'data') {
      setValidForm({ ...validForm, proposalBytes: validityCheckResultData })
      const updatedState = { ...validForm, proposalBytes: validityCheckResultData }
      setFormInputStatus({ ...formInputStatus, proposalBytes: updatedState.proposalBytes ? 'success' : 'error' })
    }
  }

  console.log('%c ||||| formInputStatus', 'color:yellowgreen', formInputStatus)

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
