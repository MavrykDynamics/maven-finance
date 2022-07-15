import { StageOneFormView } from './StageOneForm.view'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { State } from 'reducers'

import {
  SubmitProposalFormInputStatus,
  SubmitProposalForm,
  ValidSubmitProposalForm,
} from '../../../utils/TypesAndInterfaces/Forms'
import {
  getFormErrors,
  isNotAllWhitespace,
  isValidHttpUrl,
  validateFormAndThrowErrors,
} from '../../../utils/validatorFunctions'
import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'
import { ERROR } from '../../../app/App.components/Toaster/Toaster.constants'
import { submitProposal } from '../ProposalSubmission.actions'

type StageOneFormProps = {
  locked: boolean
}
export const StageOneForm = ({ locked }: StageOneFormProps) => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { governanceStorage } = useSelector((state: State) => state.governance)
  const { fee, governancePhase } = governanceStorage
  const isProposalRound = governancePhase === 'PROPOSAL'
  const successReward = governanceStorage.config.successReward
  const [form, setForm] = useState<SubmitProposalForm>({
    title: '',
    description: '',
    ipfs: '',
    successMVKReward: 0,
    invoiceTable: '',
    sourceCodeLink: '',
  })
  const [validForm, setValidForm] = useState<ValidSubmitProposalForm>({
    title: false,
    description: false,
    ipfs: true,
    successMVKReward: true,
    invoiceTable: true,
    sourceCodeLink: false,
  })
  const [formInputStatus, setFormInputStatus] = useState<SubmitProposalFormInputStatus>({
    title: '',
    description: '',
    ipfs: '',
    successMVKReward: '',
    invoiceTable: 'success',
    sourceCodeLink: '',
  })

  const handleOnBlur = (e: any, formField: string) => {
    let updatedState, validityCheckResult
    switch (formField) {
      case 'TITLE':
        validityCheckResult = isNotAllWhitespace(form.title)
        setValidForm({ ...validForm, title: validityCheckResult })
        updatedState = { ...validForm, title: validityCheckResult }
        setFormInputStatus({ ...formInputStatus, title: updatedState.title ? 'success' : 'error' })
        break
      case 'DESCRIPTION':
        validityCheckResult = isNotAllWhitespace(form.description)
        setValidForm({ ...validForm, description: validityCheckResult })
        updatedState = { ...validForm, description: validityCheckResult }
        setFormInputStatus({ ...formInputStatus, description: updatedState.description ? 'success' : 'error' })
        break
      case 'SUCCESS_MVK_REWARD':
        setValidForm({ ...validForm, successMVKReward: form.successMVKReward >= 0 })
        updatedState = { ...validForm, successMVKReward: form.successMVKReward >= 0 }
        setFormInputStatus({
          ...formInputStatus,
          successMVKReward: updatedState.successMVKReward ? 'success' : 'error',
        })
        break
      case 'SOURCE_CODE_LINK':
        validityCheckResult = isValidHttpUrl(form.sourceCodeLink)
        setValidForm({ ...validForm, sourceCodeLink: validityCheckResult })
        updatedState = { ...validForm, sourceCodeLink: validityCheckResult }
        setFormInputStatus({ ...formInputStatus, sourceCodeLink: updatedState.sourceCodeLink ? 'success' : 'error' })
        break
      case 'IPFS':
        setValidForm({ ...validForm, ipfs: Boolean(e) })
        break
    }
  }

  const clearState = (): void => {
    setForm({
      title: '',
      description: '',
      ipfs: '',
      successMVKReward: 0,
      invoiceTable: '',
      sourceCodeLink: '',
    })
    setValidForm({
      title: false,
      description: false,
      ipfs: true,
      successMVKReward: true,
      invoiceTable: true,
      sourceCodeLink: false,
    })
    setFormInputStatus({
      title: '',
      description: '',
      ipfs: '',
      successMVKReward: '',
      invoiceTable: 'success',
      sourceCodeLink: '',
    })
  }

  useEffect(() => {
    if (!isProposalRound) clearState()
  }, [isProposalRound])

  const handleSubmitProposal = async () => {
    const formIsValid = validateFormAndThrowErrors(dispatch, validForm)
    if (formIsValid) await dispatch(submitProposal(form, fee, clearState))
  }

  return (
    <StageOneFormView
      locked={locked}
      form={form}
      fee={fee}
      successReward={successReward}
      setForm={setForm}
      formInputStatus={formInputStatus}
      handleOnBlur={handleOnBlur}
      handleSubmitProposal={handleSubmitProposal}
    />
  )
}
