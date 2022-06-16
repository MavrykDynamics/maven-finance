import { GovernancePhase } from '../../reducers/governance'
import { ProposalStatus, TokenStandardType, PaymentType } from '../../utils/TypesAndInterfaces/Governance'

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
export const getShortByte = (byte: string): string => {
  const shortBype = byte.length
    ? [
        byte.substring(0, BEFORE_DIGIT),
        byte.length > BEFORE_DIGIT ? '...' : '',
        byte.length > BEFORE_DIGIT ? byte.substring(byte.length - AFTER_DIGIT) : '',
      ]
    : []

  return shortBype.join('')
}
