import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { ProposalUpdateFormProposalBytes } from 'utils/TypesAndInterfaces/Forms'
import { CurrentRoundProposalsStorageType, ProposalDataType } from 'utils/TypesAndInterfaces/Governance'

export const checkWtheterBytesIsValid = (bytes: Array<ProposalUpdateFormProposalBytes>): boolean => {
  return bytes.every(({ bytes }) => Boolean(bytes))
}

export const getBytesPairValidationStatus = (
  newText: string,
  fieldToValidate: 'validTitle' | 'validBytes',
  currentByteId: number,
  proposalData?: Array<ProposalDataType>,
): typeof INPUT_STATUS_SUCCESS | typeof INPUT_STATUS_ERROR => {
  const isExistTitleInServer = proposalData?.some(({ id }) => id === currentByteId)

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
  validTitle: '' as InputStatusType,
  validBytes: '' as InputStatusType,
  order: 1,
  isUnderTheDrop: false,
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
