import { InputStatusType } from 'app/App.components/Input/Input.constants'
import type { ProposalDataType } from '../../utils/TypesAndInterfaces/Governance'

/**
 * Types for forms
 * 1. Proposal Submission
 * 2. Proposal Update
 * 3. Financial Request
 */
export type AllValidFormTypes =
  | ValidSubmitProposalForm
  | ValidProposalUpdateForm
  | ValidFinancialRequestForm
  | ValidRegisterAsSatelliteForm
  | ValidEmergencyGovernanceProposalForm
  | ValidStakeUnstakeForm

export type SubmitProposalForm = {
  title: string
  description: string
  ipfs: string
  successMVKReward: number
  invoiceTable: string
  sourceCodeLink: string
}

export type ValidSubmitProposalForm = {
  title: boolean | undefined
  description: boolean | undefined
  ipfs: boolean | undefined
  successMVKReward: boolean | undefined
  invoiceTable: boolean | undefined
  sourceCodeLink: boolean | undefined
}

export type SubmitProposalFormInputStatus = {
  title: InputStatusType
  description: InputStatusType
  ipfs: InputStatusType
  successMVKReward: InputStatusType
  invoiceTable: InputStatusType
  sourceCodeLink: InputStatusType
}

export type ProposalBytesType = {
  id: number
  title: string
  data: string
}

export type ProposalUpdateFormProposalBytes = {
  validTitle: InputStatusType
  validBytes: InputStatusType
  bytes: string
  governance_proposal_record_id: number
  id: number
  record_internal_id: number
  title: string
  order: number
}

export type ProposalUpdateForm = {
  title: string
  proposalBytes: ProposalUpdateFormProposalBytes[]
}
export type ValidProposalUpdateForm = {
  title: boolean | undefined
  proposalBytes: boolean | undefined
}

export type ProposalUpdateFormInputStatus = {
  title: InputStatusType
  proposalBytes: InputStatusType
}

export type ProposalFinancialRequestForm = {
  title: string
  financialData: {
    jsonString: string
  }
}
export type ValidFinancialRequestForm = {
  financialData: boolean | undefined
}

export type ProposalFinancialRequestInputStatus = {
  financialData: InputStatusType
}

export type RegisterAsSatelliteForm = {
  name: string
  description: string
  website: string
  fee: number
  image: string
}

export type ValidRegisterAsSatelliteForm = {
  name: boolean | undefined
  description: boolean | undefined
  website: boolean | undefined
  fee: boolean | undefined
  image: boolean | undefined
}
export type RegisterAsSatelliteFormInputStatus = {
  name: InputStatusType
  description: InputStatusType
  website: InputStatusType
  fee: InputStatusType
  image: InputStatusType
}

export type EmergencyGovernanceProposalForm = {
  title: string
  description: string
}
export type ValidEmergencyGovernanceProposalForm = {
  title: boolean
  description: boolean
}
export type EmergencyGovernanceProposalFormInputStatus = {
  title: InputStatusType
  description: InputStatusType
}

export type StakeUnstakeForm = {
  amount: number | ''
}

export type ValidStakeUnstakeForm = {
  amount: boolean | undefined
}

export type StakeUnstakeFormInputStatus = {
  amount: InputStatusType
}
