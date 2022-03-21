import { InputStatusType } from '../../app/App.components/Input/Input.controller'

/**
 * Types for forms
 * 1. Proposal Submission
 * 2. Proposal Update
 * 3. Financial Request
 */
export type AllValidFormTypes = ValidSubmitProposalForm | ValidProposalUpdateForm | ValidFinancialRequestForm

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
