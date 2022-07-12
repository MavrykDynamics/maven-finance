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
  firstVisible: boolean
}
export const Proposals = ({
  proposalsList,
  handleItemSelect,
  selectedProposal,
  title = '',
  type,
  firstVisible,
  listName,
}: ProposalsProps) => {
  const location = useLocation()

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

  if (type === 'history') {
    proposalListTitle = 'Past Proposals'
    isProposalPhase = false
  }

  const onProposalHistoryPage = location.pathname === '/proposal-history'
  return (
    <ProposalsView
      listTitle={title || proposalListTitle}
      proposalsList={proposalsList}
      handleItemSelect={handleItemSelect}
      selectedProposal={selectedProposal}
      isProposalPhase={!onProposalHistoryPage}
      firstVisible={firstVisible}
      listName={listName}
    />
  )
}
