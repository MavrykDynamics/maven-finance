import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { ProposalRecordType } from 'utils/TypesAndInterfaces/Governance'

export type StageTwoFormProps = {
  proposalId: number
  currentProposal: ProposalRecordType
  updateLocalProposalData: ChangeProposalFnType
  handleDropProposal: (proposalId: number) => void
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
