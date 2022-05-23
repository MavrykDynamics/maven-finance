import { useState } from 'react'
import { useDispatch } from 'react-redux'

import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'
import { ERROR } from '../../../app/App.components/Toaster/Toaster.constants'
// prettier-ignore
import { ProposalFinancialRequestForm, ProposalFinancialRequestInputStatus, ValidFinancialRequestForm } from '../../../utils/TypesAndInterfaces/Forms'
import {
  getFormErrors,
  isJsonString,
  validateFormAndThrowErrors,
  containsCode,
} from '../../../utils/validatorFunctions'
import { submitFinancialRequestData } from '../ProposalSubmission.actions'
import { StageThreeFormView } from './StageThreeForm.view'

type StageThreeFormProps = {
  locked: boolean
  accountPkh?: string
}
const INIT_TABLE_DATA = [[''], ['']]

export const StageThreeForm = ({ locked, accountPkh }: StageThreeFormProps) => {
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
    const jsonStringTable = JSON.stringify(tableData)
    const flatTable = tableData.flat()
    const isEmptyFlatTable = flatTable.every((elem) => !elem)
    const isStringcontainsCode = containsCode(JSON.stringify(tableData))
    const isValidJsonString = !isStringcontainsCode && !isEmptyFlatTable
    const formIsValid = validateFormAndThrowErrors(dispatch, {
      financialData: isValidJsonString,
    })
    if (formIsValid) {
      dispatch(submitFinancialRequestData(jsonStringTable, accountPkh as any))
    }
  }

  return (
    <StageThreeFormView
      locked={locked}
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
