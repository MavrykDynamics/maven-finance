import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import type { ProposalDataType, ProposalPaymentType } from '../../../utils/TypesAndInterfaces/Governance'
import { calcWithoutPrecision, calcWithoutMu } from '../../../utils/calcFunctions'

// helpers
import {
  normalizeProposalStatus,
  normalizeTokenStandart,
  getShortByte,
  getProposalStatusInfo,
} from '../../Governance/Governance.helpers'

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
  proposalId: number | undefined
  proposalTitle: string
  proposalPayments: ProposalPaymentType[] | undefined
}

export const PAYMENTS_TYPES = ['XTZ', 'MVK']

const INIT_TABLE_HEADERS = ['Address', 'Purpose', 'Amount', 'Payment Type (XTZ/MVK)']

const INIT_TABLE_DATA = [INIT_TABLE_HEADERS, ['', '', '', PAYMENTS_TYPES[0]]]

export const StageThreeForm = ({ locked, proposalTitle, proposalId, proposalPayments }: StageThreeFormProps) => {
  const dispatch = useDispatch()
  const { governanceStorage, governancePhase } = useSelector((state: State) => state.governance)
  const isProposalRound = governancePhase === 'PROPOSAL'
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { fee } = governanceStorage
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

  console.log('%c ||||| proposalPayments', 'color:red', proposalPayments)

  const handleOnBlur = () => {
    const validityCheckResult = isJsonString(form.financialData?.jsonString ?? '')
    setValidForm({ ...validForm, financialData: validityCheckResult })
    const updatedState = { ...validForm, financialData: validityCheckResult }
    setFormInputStatus({ ...formInputStatus, financialData: updatedState.financialData ? 'success' : 'error' })
  }

  const clearState = (): void => {
    setForm({
      title: proposalTitle,
      financialData: { jsonString: tableJson },
    })
    setValidForm({
      financialData: false,
    })
    setFormInputStatus({
      financialData: '',
    })
  }

  useEffect(() => {
    if (!isProposalRound) clearState()
  }, [isProposalRound])

  useEffect(() => {
    if (proposalPayments?.length) {
      const prepareTablePayments = proposalPayments.map((item) => {
        const paymentType = normalizeTokenStandart(item.token)
        const amount =
          paymentType === 'MVK' ? calcWithoutPrecision(item.token_amount) : calcWithoutMu(item.token_amount)
        return [item.to__id, item.title, `${amount}`, paymentType]
      }) as string[][]
      setTableData([INIT_TABLE_HEADERS, ...prepareTablePayments])
    }
  }, [proposalPayments])

  const handleSubmitFinancialRequestData = () => {
    const submitData = tableData.filter((_, i) => i !== 0)
    if (proposalId) {
      dispatch(submitFinancialRequestData(proposalId, submitData, accountPkh as any))
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
