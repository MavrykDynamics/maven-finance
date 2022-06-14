import { GovernancePhase } from '../../reducers/governance'
import { ProposalStatus } from '../../utils/TypesAndInterfaces/Governance'

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
        status = ProposalStatus.LOCKED
      }
    }

    if (!isProposalRound && !isVotingRound && !isTimeLockRound) {
      if (numberSatus === 1) {
        status = ProposalStatus.DEFEATED
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
      } else if (locked) {
        status = ProposalStatus.DEFEATED
      }
    }
  }
  return status
}
