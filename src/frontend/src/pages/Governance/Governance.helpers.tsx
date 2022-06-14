import { GovernancePhase } from '../../reducers/governance'
import { ProposalStatus } from '../../utils/TypesAndInterfaces/Governance'

function convertProposalStatus(executed: boolean, locked: boolean, numberSatus: number): ProposalStatus {
  let status = 'ACTIVE'

  if (numberSatus === 1) {
    status = 'DEFEATED'
  } else {
    if (executed) {
      status = 'EXECUTED'
    } else if (locked) {
      status = 'LOCKED'
    }
  }

  return status as ProposalStatus
}
export const normalizeProposalStatus = (
  governancePhase: GovernancePhase,
  numberSatus: number,
  executed: boolean,
  locked: boolean,
): ProposalStatus => {
  let status = ProposalStatus.ACTIVE
  const isProposalRound = governancePhase === 'PROPOSAL'
  const isVotingRound = governancePhase === 'VOTING'
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  if (isProposalRound) {
    if (locked) {
      status = ProposalStatus.LOCKED
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
  return status
}
