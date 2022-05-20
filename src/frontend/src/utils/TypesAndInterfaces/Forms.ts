import { InputStatusType } from '../../app/App.components/Input/Input.controller'

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

export type ProposalUpdateForm = {
  title: string
  proposalId: number
  proposalBytes: string
}
export type ValidProposalUpdateForm = {
  proposalBytes: boolean | undefined
}

export type ProposalUpdateFormInputStatus = {
  proposalBytes: InputStatusType
}

export type ProposalFinancialRequestForm = {
  title: string
  proposalId: number
  financialData: {
    rows?: any[]
    columns?: any[]
    jsonString?: string
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
  amountMVKtoTriggerBreakGlass: number
  description: string
  screenshots: string
}
export type ValidEmergencyGovernanceProposalForm = {
  title: boolean
  amountMVKtoTriggerBreakGlass: boolean
  description: boolean
  screenshots: boolean
}
export type EmergencyGovernanceProposalFormInputStatus = {
  title: InputStatusType
  amountMVKtoTriggerBreakGlass: InputStatusType
  description: InputStatusType
  screenshots: InputStatusType
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
