import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { Governance_Proposal } from 'utils/generated/graphqlTypes'
import {
  CurrentRoundProposalsStorageType,
  ProposalDataType,
  ProposalRecordType,
} from 'utils/TypesAndInterfaces/Governance'

export const checkWtheterBytesIsValid = (proposalData: ProposalRecordType['proposalData']): boolean => {
  return proposalData.every(({ bytes, title }) => Boolean(bytes) && Boolean(title))
}

export const getBytesPairValidationStatus = (
  newText: string,
  fieldToValidate: 'validTitle' | 'validBytes',
  currentByteId: number,
  proposalData?: ProposalRecordType['proposalData'],
): typeof INPUT_STATUS_SUCCESS | typeof INPUT_STATUS_ERROR => {
  const isExistTitleInServer = proposalData?.some(({ id, isLocalBytes }) => id === currentByteId && !isLocalBytes)

  if (fieldToValidate === 'validTitle') {
    return Boolean(newText) && !isExistTitleInServer ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
  } else {
    return Boolean(newText) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
  }
}

export const PROPOSAL_BYTE = {
  bytes: '',
  id: 1,
  title: '',
  order: 1,
  isUnderTheDrop: false,
  isLocalBytes: true,
  governance_proposal: {} as Governance_Proposal,
  governance_proposal_id: 0,
  record_internal_id: 0,
}

export const setDefaultProposalBytes = (proposalData?: Array<ProposalDataType>) =>
  proposalData?.length
    ? proposalData.map((item, idx) => ({
        ...PROPOSAL_BYTE,
        ...item,
        order: idx + 1,
      }))
    : [PROPOSAL_BYTE]

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
