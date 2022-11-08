import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { Governance_Proposal } from 'utils/generated/graphqlTypes'
import { ValidSubmitProposalForm, SubmitProposalFormInputStatus } from 'utils/TypesAndInterfaces/Forms'
import { CurrentRoundProposalsStorageType, ProposalRecordType } from 'utils/TypesAndInterfaces/Governance'
import { StageThreeValidityItem } from './ProposalSybmittion.types'

export const checkWhetherBytesIsValid = (proposalData: ProposalRecordType['proposalData']): boolean => {
  return proposalData.every(({ encoded_code, title }) => Boolean(encoded_code) && Boolean(title))
}

export const getBytesPairValidationStatus = (
  newText: string,
  fieldToValidate: 'validTitle' | 'validBytes',
): typeof INPUT_STATUS_SUCCESS | typeof INPUT_STATUS_ERROR => {
  if (fieldToValidate === 'validTitle') {
    return Boolean(newText) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
  } else {
    return Boolean(newText) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
  }
}

export const getValidityStageThreeTable = (valueName: StageThreeValidityItem, value: string | number): boolean => {
  switch (valueName) {
    case 'token_amount':
      if (Number(value) < 0) return false
      break
    case 'to__id':
      if (!value) return false
      break
    case 'title':
      if (!value) return false
      break
  }
  return true
}

export const checkBytesPairExists = (proposalDataItem: ProposalRecordType['proposalData'][number]): boolean => {
  return proposalDataItem.title !== null && proposalDataItem.encoded_code !== null
}

export const PROPOSAL_BYTE = {
  encoded_code: '',
  id: 1,
  internal_id: 0,
  title: '',
  code_description: '',
  order: 1,
  isUnderTheDrop: false,
  isLocalBytes: true,
  governance_proposal: {} as Governance_Proposal,
  governance_proposal_id: 0,
}

export const DEFAULT_PROPOSAL: CurrentRoundProposalsStorageType[number] = {
  id: -1,
  proposerId: '',
  status: 0,
  title: '',
  description: '',
  invoice: '',
  successReward: 0,
  startDateTime: '',
  executed: false,
  locked: false,
  sourceCode: '',
  passVoteMvkTotal: 0,
  upvoteMvkTotal: 0,
  downvoteMvkTotal: 0,
  abstainMvkTotal: 0,
  minProposalRoundVoteRequirement: 0,
  minProposalRoundVotePercentage: 0,
  minQuorumPercentage: 0,
  minQuorumMvkTotal: 0,
  quorumMvkTotal: 0,
  currentRoundProposal: true,
  currentCycleStartLevel: 0,
  currentCycleEndLevel: 0,
  cycle: 0,
  proposalData: [],
  proposalPayments: [],
  governanceId: '',
  paymentProcessed: false,
}

// stage 1 default values
export const DEFAULT_VALIDITY: ValidSubmitProposalForm = {
  title: false,
  description: false,
  ipfs: true,
  successMVKReward: true,
  invoiceTable: true,
  sourceCode: true,
}

export const DEFAULT_INPUT_STATUSES: SubmitProposalFormInputStatus = {
  title: '',
  description: '',
  ipfs: '',
  successMVKReward: '',
  invoiceTable: 'success',
  sourceCode: '',
}

export const PAYMENTS_TYPES = ['XTZ', 'MVK']
export const INIT_TABLE_HEADERS = ['Address', 'Purpose', 'Amount', 'Payment Type (XTZ/MVK)', '-', '-']
export const INIT_TABLE_DATA = [INIT_TABLE_HEADERS, ['', '', '', PAYMENTS_TYPES[0], '-', '-']]
export const MAX_ROWS = 10
