import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { State } from '../../../reducers'
import { ProposalRecordType } from '../../../utils/TypesAndInterfaces/Governance'
import { ProposalsView } from './Proposals.view'

type ProposalsProps = {
  proposalsList: ProposalRecordType[]
  handleItemSelect: (proposalListItem: ProposalRecordType | undefined) => void
  selectedProposal: ProposalRecordType | undefined
  title?: string
  type: string
  listName: string
}
export const Proposals = ({
  proposalsList,
  handleItemSelect,
  selectedProposal,
  title = '',
  type,
  listName,
}: ProposalsProps) => {
  const location = useLocation()

  const { governancePhase } = useSelector((state: State) => state.governance)
  let proposalListTitle = ''
  switch (governancePhase) {
    case 'VOTING':
      proposalListTitle = 'Ongoing Proposals'
      break
    case 'TIME_LOCK':
      proposalListTitle = 'Proposals on Timelock'
      break
    case 'PROPOSAL':
      proposalListTitle = 'Poll for next proposals'
      break
    default:
      proposalListTitle = 'Past Proposals'
      break
  }

  if (type === 'history') {
    proposalListTitle = 'Past Proposals'
  }

  const onProposalHistoryPage = location.pathname === '/proposal-history'
  return (
    <ProposalsView
      listTitle={title || proposalListTitle}
      proposalsList={proposalsList}
      handleItemSelect={handleItemSelect}
      selectedProposal={selectedProposal}
      isProposalPhase={!onProposalHistoryPage}
      listName={listName}
      showVotersList={governancePhase === 'TIME_LOCK' || governancePhase === 'VOTING'}
    />
  )
}
