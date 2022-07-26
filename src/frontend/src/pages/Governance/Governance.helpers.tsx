import { GovernancePhase } from '../../reducers/governance'
import { ProposalStatus, TokenStandardType, PaymentType } from '../../utils/TypesAndInterfaces/Governance'
import { ProposalRecordType, CurrentRoundProposalsStorageType } from '../../utils/TypesAndInterfaces/Governance'

export const getProposalStatusInfo = (
  governancePhase: GovernancePhase,
  proposal: ProposalRecordType | undefined,
  timelockProposalId: number,
  isProposalPhase: boolean,
  cycleHighestVotedProposalId: number,
  cycleCounter: number,
): {
  statusFlag: ProposalStatus
  satelliteAbleToMakeProposalRoundVote: boolean
  showWaitingForExecutionHeader: boolean
  anyUserCanExecuteProposal: boolean
  showWaitingForPaymentToBeProcessedHeader: boolean
  anyUserCanProcessProposalPayment: boolean
  satelliteAbleToMakeVotingRoundVote: boolean
} => {
  // let statusFlag = ProposalStatus.ACTIVE
  let statusFlag = ProposalStatus.DROPPED
  let satelliteAbleToMakeProposalRoundVote = false
  let showWaitingForExecutionHeader = false
  let anyUserCanExecuteProposal = false
  let showWaitingForPaymentToBeProcessedHeader = false
  let anyUserCanProcessProposalPayment = false
  let satelliteAbleToMakeVotingRoundVote = false
  const isProposalRound = governancePhase === 'PROPOSAL'
  const isVotingRound = governancePhase === 'VOTING'
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  if (isProposalPhase) {
    if (isProposalRound) {
      // is Proposal Period
      if (proposal?.currentRoundProposal) {
        if (proposal?.locked) {
          statusFlag = ProposalStatus.LOCKED
          satelliteAbleToMakeProposalRoundVote = true
        } else {
          statusFlag = ProposalStatus.UNLOCKED
          satelliteAbleToMakeProposalRoundVote = false
        }
        // if proposal from a previous round and their id matches the id of the proposal from the timelock round
      } else if (timelockProposalId === proposal?.id) {
        if (!proposal?.executed) {
          statusFlag = ProposalStatus.WAITING
          showWaitingForExecutionHeader = true
          anyUserCanExecuteProposal = true // Already passed the voting and just waiting to be executed
        } else if (!proposal.paymentProcessed && proposal?.proposalPayments && proposal?.proposalPayments?.length > 0) {
          statusFlag = ProposalStatus.WAITING
          showWaitingForPaymentToBeProcessedHeader = true
          anyUserCanProcessProposalPayment = true // Already executed and just need the payment to be processed
        } else {
          //Don't show the proposal as its already executed
        }
      } else {
        statusFlag = ProposalStatus.DROPPED
      }
    }

    if (isVotingRound) {
      // If proposal is of current round
      // NEW: && if the proposal's id === the cycle_highest_voted_proposal_id in the governanceStorage
      if (proposal?.currentRoundProposal && proposal.id === cycleHighestVotedProposalId) {
        statusFlag = ProposalStatus.ONGOING
        satelliteAbleToMakeVotingRoundVote = true
      }
      //There is only 1 proposal to be shown during the voting round
    }

    if (isTimeLockRound) {
      // Timelock Period
      // If proposal is of current round
      // NEW: && if the proposal's id === the timelock_proposal_id in the governanceStorage
      if (proposal?.currentRoundProposal && proposal.id === timelockProposalId) {
        statusFlag = ProposalStatus.TIMELOCK
      }
      //There is only 1 proposal to be shown during the timelock
      // round and not able to vote on it at all
    }

    if (!isProposalRound && !isVotingRound && !isTimeLockRound) {
      if (proposal?.status === 1) {
        statusFlag = ProposalStatus.DROPPED
      } else {
        if (proposal?.executed) {
          statusFlag = ProposalStatus.EXECUTED
        } else if (proposal?.locked) {
          statusFlag = ProposalStatus.LOCKED
        }
      }
    }
  } else {
    // If a proposal is not of the current round so its a past proposal
    // Assuming its a proposal that has been executed or defeated. Not one that
    // is waiting to be executed / have its payment processed. STILL need to check
    // for this to show it on the main proposals page
    if (!proposal?.currentRoundProposal && proposal && proposal?.cycle < cycleCounter) {
      if (proposal?.executed) {
        statusFlag = ProposalStatus.EXECUTED
      } else {
        statusFlag = ProposalStatus.DEFEATED
      }
    }
  }
  return {
    statusFlag,
    satelliteAbleToMakeProposalRoundVote,
    showWaitingForExecutionHeader,
    anyUserCanExecuteProposal,
    showWaitingForPaymentToBeProcessedHeader,
    anyUserCanProcessProposalPayment,
    satelliteAbleToMakeVotingRoundVote,
  }
}

export const normalizeProposalStatus = (
  governancePhase: GovernancePhase,
  numberSatus: number,
  executed: boolean,
  locked: boolean,
  isProposalPhase: boolean,
): ProposalStatus => {
  let status = ProposalStatus.ACTIVE
  const isProposalRound = governancePhase === 'PROPOSAL'
  const isVotingRound = governancePhase === 'VOTING'
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  if (isProposalPhase) {
    if (isProposalRound) {
      if (locked) {
        status = ProposalStatus.LOCKED
      } else {
        status = ProposalStatus.UNLOCKED
      }
    }

    if (isVotingRound) {
      if (locked) {
        status = ProposalStatus.ONGOING
      }
    }

    if (isTimeLockRound) {
      if (locked) {
        status = ProposalStatus.TIMELOCK
      }
    }

    if (!isProposalRound && !isVotingRound && !isTimeLockRound) {
      if (numberSatus === 1) {
        status = ProposalStatus.DROPPED
      } else {
        if (executed) {
          status = ProposalStatus.EXECUTED
        } else if (locked) {
          status = ProposalStatus.LOCKED
        }
      }
    }
  } else {
    if (numberSatus === 1) {
      status = ProposalStatus.DROPPED
    } else {
      if (executed) {
        status = ProposalStatus.EXECUTED
      } else {
        status = ProposalStatus.DEFEATED
      }
    }
  }
  return status
}

export const normalizeTokenStandart = (standatd: TokenStandardType, address: string, token_id: string): PaymentType => {
  return standatd === 2 && address && token_id ? 'MVK' : 'XTZ'
}

const BEFORE_DIGIT = 24
const AFTER_DIGIT = 12
export const getShortByte = (
  byte: string,
  beforeDigit: number = BEFORE_DIGIT,
  afterDigit: number = AFTER_DIGIT,
): string => {
  const shortBype = byte.length
    ? [
        byte.substring(0, beforeDigit),
        byte.length > beforeDigit ? '...' : '',
        byte.length > beforeDigit ? byte.substring(byte.length - afterDigit) : '',
      ]
    : []

  return shortBype.join('')
}
