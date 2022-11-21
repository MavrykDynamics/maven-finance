import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import BigNumber from 'bignumber.js'
import { ProposalRecordType } from 'utils/TypesAndInterfaces/Governance'

export type ValidationStateType = {
  validTitle: InputStatusType
  validBytes: InputStatusType
  pairId: number
}[]

export type ProposalBytesType = ProposalRecordType['proposalData'][number]

export type SubmittedProposalsMapper = {
  keys: number[]
  mapper: Record<number, ProposalRecordType>
  validityObj: Record<number, ProposalValidityObj>
}

export type ChangeProposalFnType = (newProposalData: Partial<ProposalRecordType>, proposalId: number) => void
export type ChangeProposalValidationFnType = (
  newProposalValidation: Partial<ProposalValidityObj>,
  proposalId: number,
) => void

export type ValidationResult = typeof INPUT_STATUS_ERROR | typeof INPUT_STATUS_SUCCESS | ''

export type ProposalValidityObj = {
  title: ValidationResult
  description: ValidationResult
  ipfs: ValidationResult
  successMVKReward: ValidationResult
  invoiceTable: ValidationResult
  sourceCode: ValidationResult
  bytesValidation: Array<{
    validBytes: ValidationResult
    validTitle: ValidationResult
    byteId: number
  }>
  paymentsValidation: Array<{
    token_amount: ValidationResult
    title: ValidationResult
    to__id: ValidationResult
    paymentId: number
  }>
}

export type StageOneFormProps = {
  proposalId: number
  currentProposal: ProposalRecordType
  currentProposalValidation: ProposalValidityObj
  updateLocalProposalValidation: ChangeProposalValidationFnType
  updateLocalProposalData: ChangeProposalFnType
}

export type StageTwoFormProps = {
  proposalId: number
  currentProposal: ProposalRecordType
  currentProposalValidation: ProposalValidityObj
  updateLocalProposalValidation: ChangeProposalValidationFnType
  setProposalHasChange: (arg: boolean) => void
  updateLocalProposalData: ChangeProposalFnType
}

export type StageThreeFormProps = {
  proposalId: number
  currentProposal: ProposalRecordType
  paymentMethods: Array<{ symbol: string; address: string; shortSymbol: string; id: number }>
  currentProposalValidation: ProposalValidityObj
  updateLocalProposalValidation: ChangeProposalValidationFnType
  setProposalHasChange: (arg: boolean) => void
  updateLocalProposalData: ChangeProposalFnType
}

export type StageThreeValidityItem = 'token_amount' | 'to__id' | 'title'

// addOrSetProposalData(title, bytes, codeDescription, option(index)) => If no index is referenced, the data will be added at the tail of the list OR if index is referenced, the data will replace the current value at the given index.
// removeProposalData(index) => Will set to null the value at the given index (the value can still be updated with addOrSetProposalData)
export type ProposalDataChangesType = Array<{
  addOrSetProposalData?: {
    title: string
    encodedCode: string
    codeDescription: string
    index?: string
    localId?: number
  }
  removeProposalData?: string
}>

// addOrSetPaymentData(title, transactionInfo, option(index)) => If no index is referenced, the data will be added at the tail of the list OR if index is referenced, the data will replace the current value at the given index.
// removePaymentData(index) => Will set to null the value at the given index (the value can still be updated with addOrSetPaymentData)
export type TokenName = string
export type PaymentsDataChangesType = Array<{
  addOrSetPaymentData?: {
    title: string
    transaction: {
      to_: string
      token: Record<
        TokenName,
        {
          tokenContractAddress: string
          tokenId: number
        }
      >
      amount: BigNumber
    }
    index?: string
    localId?: number
  }
  removePaymentData?: string
}>

export type ProposalChangesStateType = Record<
  string | number,
  {
    proposalDataChanges: ProposalDataChangesType
    proposalPaymentsChanges: PaymentsDataChangesType
  }
>
