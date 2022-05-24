import { useState } from 'react'
import { useDispatch } from 'react-redux'

import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'
import { ERROR } from '../../../app/App.components/Toaster/Toaster.constants'

import {
  ProposalFinancialRequestForm,
  ProposalFinancialRequestInputStatus,
  ValidFinancialRequestForm,
} from '../../../utils/TypesAndInterfaces/Forms'
import { getFormErrors, isJsonString, validateFormAndThrowErrors } from '../../../utils/validatorFunctions'
import { submitFinancialRequestData } from '../ProposalSubmission.actions'
import { StageThreeFormView } from './StageThreeForm.view'

type StageThreeFormProps = {
  loading: boolean
  accountPkh?: string
}
const INIT_TABLE_DATA = [[''], ['']]

export const StageThreeForm = ({ loading, accountPkh }: StageThreeFormProps) => {
  const dispatch = useDispatch()

  const [tableData, setTableData] = useState(INIT_TABLE_DATA)
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
    const formIsValid = validateFormAndThrowErrors(dispatch, validForm)
    if (formIsValid) {
      dispatch(submitFinancialRequestData(form.financialData?.jsonString ?? '', accountPkh as any))
    }
  }

  return (
    <StageThreeFormView
      loading={false}
      form={form}
      setForm={setForm}
      tableData={tableData}
      setTableData={setTableData}
      setTableJson={setTableJson}
      formInputStatus={formInputStatus}
      handleOnBlur={handleOnBlur}
      handleSubmitFinancialRequestData={handleSubmitFinancialRequestData}
    />
  )
}
