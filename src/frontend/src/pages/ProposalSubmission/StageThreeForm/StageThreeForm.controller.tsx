import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'
import { ERROR } from '../../../app/App.components/Toaster/Toaster.constants'

import {
  ProposalFinancialRequestForm,
  ProposalFinancialRequestInputStatus,
  ValidFinancialRequestForm,
} from '../../../utils/TypesAndInterfaces/Forms'
import {
  containsCode,
  getFormErrors,
  isJsonString,
  validateFormAndThrowErrors,
} from '../../../utils/validatorFunctions'
import { submitFinancialRequestData } from '../ProposalSubmission.actions'
import { StageThreeFormView } from './StageThreeForm.view'

type StageThreeFormProps = {
  locked: boolean
  accountPkh?: string
  proposalId: number | undefined
  proposalTitle: string
}

export const PAYMENTS_TYPES = ['XTZ', 'MVK']

const INIT_TABLE_DATA = [
  ['Address', 'Purpose', 'Amount', 'Payment Type (XTZ/MVK)'],
  ['', '', '', PAYMENTS_TYPES[0]],
]

export const StageThreeForm = ({ locked, accountPkh, proposalTitle, proposalId }: StageThreeFormProps) => {
  const dispatch = useDispatch()
  const { governanceStorage } = useSelector((state: State) => state.governance)
  const { fee, address } = governanceStorage
  const successReward = governanceStorage.config.successReward
  const [tableData, setTableData] = useState(INIT_TABLE_DATA)
  const [tableJson, setTableJson] = useState('')
  const [form, setForm] = useState<ProposalFinancialRequestForm>({
    title: proposalTitle,
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
      fee={fee}
      successReward={successReward}
      setForm={setForm}
      tableData={tableData}
      setTableData={setTableData}
      setTableJson={setTableJson}
      formInputStatus={formInputStatus}
      handleOnBlur={handleOnBlur}
      handleSubmitFinancialRequestData={handleSubmitFinancialRequestData}
      proposalId={proposalId}
    />
  )
}
