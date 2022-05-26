import { useSelector } from 'react-redux'

import { State } from '../../../reducers'
import { ProposalRecordType } from '../../../utils/TypesAndInterfaces/Governance'
import { ProposalsView } from './Proposals.view'

type ProposalsProps = {
  proposalsList: Map<string, ProposalRecordType>
  handleItemSelect: (proposalListItem: ProposalRecordType | undefined) => void
  selectedProposal: ProposalRecordType | undefined
  isProposalHistory?: boolean
}
export const Proposals = ({
  proposalsList,
  handleItemSelect,
  selectedProposal,
  isProposalHistory = false,
}: ProposalsProps) => {
  const { governancePhase } = useSelector((state: State) => state.governance)
  let proposalListTitle = '',
    isProposalPhase = false
  switch (governancePhase) {
    case 'VOTING':
      proposalListTitle = 'Ongoing Proposal'
      break
    case 'TIME_LOCK':
      proposalListTitle = 'Proposal on Timelock'
      break
    case 'PROPOSAL':
      proposalListTitle = 'Poll for next proposal'
      isProposalPhase = true
      break
    default:
      proposalListTitle = 'Past Proposals'
      break
  }

  if (isProposalHistory) {
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
