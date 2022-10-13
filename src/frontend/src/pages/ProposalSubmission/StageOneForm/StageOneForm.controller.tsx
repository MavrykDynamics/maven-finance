import { StageOneFormView } from './StageOneForm.view'
import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { State } from 'reducers'

import {
  SubmitProposalFormInputStatus,
  SubmitProposalForm,
  ValidSubmitProposalForm,
} from '../../../utils/TypesAndInterfaces/Forms'
import { isNotAllWhitespace, isValidHttpUrl, validateFormAndThrowErrors } from '../../../utils/validatorFunctions'
import { submitProposal } from '../ProposalSubmission.actions'

type StageOneFormProps = {
  locked: boolean
  proposalId: number | undefined
  proposalTitle: string
  proposalDescription: string
  proposalSourceCode: string
}

const DEFAULT_FORM: SubmitProposalForm = {
  title: '',
  description: '',
  ipfs: '',
  successMVKReward: 0,
  invoiceTable: '',
  sourceCodeLink: '',
}

const DEFAULT_VALIDITY: ValidSubmitProposalForm = {
  title: false,
  description: false,
  ipfs: true,
  successMVKReward: true,
  invoiceTable: true,
  sourceCodeLink: true,
}

const DEFAULT_INPUT_STATUSES: SubmitProposalFormInputStatus = {
  title: '',
  description: '',
  ipfs: '',
  successMVKReward: '',
  invoiceTable: 'success',
  sourceCodeLink: '',
}

export const StageOneForm = ({
  locked,
  proposalId,
  proposalDescription,
  proposalSourceCode,
  proposalTitle,
}: StageOneFormProps) => {
  const dispatch = useDispatch()
  const {
    fee,
    currentRound,
    config: { successReward },
  } = useSelector((state: State) => state.governance.governanceStorage)
  const isProposalRound = currentRound === 'PROPOSAL'
  const [form, setForm] = useState<SubmitProposalForm>(DEFAULT_FORM)
  const [validForm, setValidForm] = useState<ValidSubmitProposalForm>(DEFAULT_VALIDITY)
  const [formInputStatus, setFormInputStatus] = useState<SubmitProposalFormInputStatus>(DEFAULT_INPUT_STATUSES)

  const handleOnBlur = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
    formField: string,
  ) => {
    let validityCheckResult
    switch (formField) {
      case 'TITLE':
        validityCheckResult = isNotAllWhitespace(form.title)
        setValidForm({ ...validForm, title: validityCheckResult })
        setFormInputStatus({ ...formInputStatus, title: validityCheckResult ? 'success' : 'error' })
        break
      case 'DESCRIPTION':
        validityCheckResult = isNotAllWhitespace(form.description)
        setValidForm({ ...validForm, description: validityCheckResult })
        setFormInputStatus({ ...formInputStatus, description: validityCheckResult ? 'success' : 'error' })
        break
      case 'SUCCESS_MVK_REWARD':
        setValidForm({ ...validForm, successMVKReward: form.successMVKReward >= 0 })
        setFormInputStatus({
          ...formInputStatus,
          successMVKReward: form.successMVKReward >= 0 ? 'success' : 'error',
        })
        break
      case 'SOURCE_CODE_LINK':
        validityCheckResult = isValidHttpUrl(form.sourceCodeLink)
        // uncomment if this field needs to be validated
        // setValidForm({ ...validForm, sourceCodeLink: validityCheckResult })
        setFormInputStatus({ ...formInputStatus, sourceCodeLink: validityCheckResult ? 'success' : 'error' })
        break
      case 'IPFS':
        setValidForm({ ...validForm, ipfs: Boolean(e) })
        break
    }
  }

  const clearState = (): void => {
    setForm(DEFAULT_FORM)
    setValidForm(DEFAULT_VALIDITY)
    setFormInputStatus(DEFAULT_INPUT_STATUSES)
  }

  useEffect(() => {
    if (!isProposalRound) clearState()
  }, [isProposalRound])

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    const formIsValid = validateFormAndThrowErrors(dispatch, validForm)
    if (formIsValid) await dispatch(submitProposal(form, fee, clearState))
  }

  return (
    <StageOneFormView
      locked={locked}
      form={form}
      fee={fee}
      proposalId={proposalId}
      successReward={successReward}
      setForm={setForm}
      formInputStatus={formInputStatus}
      handleOnBlur={handleOnBlur}
      handleSubmitProposal={handleSubmitProposal}
      proposalTitle={proposalTitle}
      proposalDescription={proposalDescription}
      proposalSourceCode={proposalSourceCode}
    />
  )
}
