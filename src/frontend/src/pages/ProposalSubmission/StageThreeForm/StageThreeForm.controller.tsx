import { StageThreeFormView } from './StageThreeForm.view'
import { useDispatch } from 'react-redux'
import { useState } from 'react'
import {
  ProposalFinancialRequestForm,
  ProposalFinancialRequestInputStatus,
  ValidFinancialRequestForm,
} from '../../../utils/TypesAndInterfaces/Forms'
import { getFormErrors, isJsonString } from '../../../utils/validatorFunctions'
import { submitFinancialRequestData } from '../ProposalSubmission.actions'
import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'
import { ERROR } from '../../../app/App.components/Toaster/Toaster.constants'

type StageThreeFormProps = {
  loading: boolean
  accountPkh?: string
}
export const StageThreeForm = ({ loading, accountPkh }: StageThreeFormProps) => {
  const dispatch = useDispatch()

  const [tableJson, setTableJson] = useState('')
  const [form, setForm] = useState<ProposalFinancialRequestForm>({
    title: 'Hello There',
    proposalId: 234,
    financialData: { jsonString: tableJson },
  })
  const [validForm, setValidForm] = useState<ValidFinancialRequestForm>({
    financialData: false,
  })
  const [formInputStatus, setFormInputStatus] = useState<ProposalFinancialRequestInputStatus>({
    financialData: '',
  })

  const handleOnBlur = () => {
    const validityCheckResult = isJsonString(form.financialData?.jsonString ?? '')
    setValidForm({ ...validForm, financialData: validityCheckResult })
    const updatedState = { ...validForm, financialData: validityCheckResult }
    setFormInputStatus({ ...formInputStatus, financialData: updatedState.financialData ? 'success' : 'error' })
  }

  const handleSubmitFinancialRequestData = () => {
    const formIsValid = validateForm()
    if (formIsValid) {
      dispatch(submitFinancialRequestData(form.financialData?.jsonString ?? '', accountPkh as any))
    }
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
    <StageThreeFormView
      loading={loading}
      form={form}
      setForm={setForm}
      setTableJson={setTableJson}
      formInputStatus={formInputStatus}
      handleOnBlur={handleOnBlur}
      handleSubmitFinancialRequestData={handleSubmitFinancialRequestData}
    />
  )
}
