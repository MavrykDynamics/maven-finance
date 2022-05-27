import { StageOneFormView } from './StageOneForm.view'
import { useRef, useState } from 'react'
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
import { useDispatch, useSelector } from 'react-redux'
import { submitProposal } from '../ProposalSubmission.actions'
import { State } from '../../../reducers'

type StageOneFormProps = {
  locked: boolean
}
export const StageOneForm = ({ locked }: StageOneFormProps) => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
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
    ipfs: false,
    successMVKReward: false,
    invoiceTable: false,
    sourceCodeLink: false,
  })
  const [formInputStatus, setFormInputStatus] = useState<SubmitProposalFormInputStatus>({
    title: '',
    description: '',
    ipfs: '',
    successMVKReward: '',
    invoiceTable: '',
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
        updatedState = { ...validForm, invoiceTable: validityCheckResult }
        setFormInputStatus({ ...formInputStatus, sourceCodeLink: updatedState.sourceCodeLink ? 'success' : 'error' })
        break
    }
  }
  const handleSubmitProposal = () => {
    const formIsValid = validateFormAndThrowErrors(dispatch, validForm)
    if (formIsValid) dispatch(submitProposal(form, accountPkh as any))
  }

  return (
    <StageOneFormView
      locked={locked}
      form={form}
      setForm={setForm}
      formInputStatus={formInputStatus}
      handleOnBlur={handleOnBlur}
      handleSubmitProposal={handleSubmitProposal}
    />
  )
}
