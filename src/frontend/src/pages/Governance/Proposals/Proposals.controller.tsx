import { GovernancePhase } from '../../../reducers/governance'
import { ProposalData } from '../mockProposals'
import { ProposalsView } from './Proposals.view'

type ProposalsProps = {
  governancePhase: GovernancePhase | 'PROPOSAL_HISTORY'
  proposalsList: Map<string, ProposalData>
  handleItemSelect: (proposalListItem: ProposalData) => void
  selectedProposal: ProposalData
}
export const Proposals = ({ governancePhase, proposalsList, handleItemSelect, selectedProposal }: ProposalsProps) => {
  let proposalListTitle = '',
    isProposalPhase = true
  switch (governancePhase) {
    case 'VOTING':
    case 'TIME_LOCK':
      proposalListTitle = 'Ongoing Proposal'
      isProposalPhase = false
      break
    case 'PROPOSAL':
      proposalListTitle = 'Poll for next proposal'
      break
    default:
      proposalListTitle = 'Past Proposals'
      isProposalPhase = false
  }
  return (
    <ProposalsView
      listTitle={proposalListTitle}
      proposalsList={proposalsList}
      handleItemSelect={handleItemSelect}
      selectedProposal={selectedProposal}
      isProposalPhase={isProposalPhase}
    />
  )
}
