import { GovernancePhase } from '../../reducers/governance'
import { ProposalStatus } from '../../utils/TypesAndInterfaces/Governance'

export const normalizeProposalStatus = (
  governancePhase: GovernancePhase,
  proposalStatus: ProposalStatus | undefined,
) => {
  return governancePhase === 'VOTING' && proposalStatus === ProposalStatus.LOCKED
    ? ProposalStatus.ONGOING
    : proposalStatus
}
