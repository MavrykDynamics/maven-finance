import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { ProposalRecordType } from 'utils/TypesAndInterfaces/Governance'

export type StageTwoFormProps = {
  proposalId: number
  currentProposal: ProposalRecordType
  updateLocalProposalData: ChangeProposalFnType
  handleDropProposal: (proposalId: number) => void
  proposalChangesState: ProposalChangesStateType
  setProposalsChangesState: (arg: ProposalChangesStateType) => void
}

export type ValidationStateType = {
  validTitle: InputStatusType
  validBytes: InputStatusType
  proposalId: number
}[]

export type ProposalBytesType = ProposalRecordType['proposalData'][number]

export type SubmittedProposalsMapper = {
  keys: number[]
  mapper: Record<number, ProposalRecordType>
}

export type ChangeProposalFnType = (newProposalData: Partial<ProposalRecordType>, proposalId: number) => void

export type StageOneFormProps = {
  proposalId: number
  currentProposal: ProposalRecordType
  updateLocalProposalData: ChangeProposalFnType
  handleDropProposal: (proposalId: number) => void
}

export type StageThreeFormProps = {
  proposalId: number
  currentProposal: ProposalRecordType
  updateLocalProposalData: ChangeProposalFnType
  handleDropProposal: (proposalId: number) => void
  handleLockProposal: (proposalId: number) => void
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
// | { removeProposalData?: string }

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
      amount: number
    }
    index?: string
  }
  removePaymentData: string
}>

export type ProposalChangesStateType = Record<
  string | number,
  {
    proposalDataChanges: ProposalDataChangesType
    proposalPaymentsChanges: PaymentsDataChangesType
  }
>
