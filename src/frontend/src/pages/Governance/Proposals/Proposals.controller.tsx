import { useSelector } from 'react-redux'

import { State } from '../../../reducers'
import { ProposalRecordType } from '../../../utils/TypesAndInterfaces/Governance'
import { ProposalsView } from './Proposals.view'

type ProposalsProps = {
  proposalsList: ProposalRecordType[]
  handleItemSelect: (proposalListItem: ProposalRecordType | undefined) => void
  selectedProposal: ProposalRecordType | undefined
  title?: string
  type: string
  firstVisible: boolean
}
export const Proposals = ({
  proposalsList,
  handleItemSelect,
  selectedProposal,
  title = '',
  type,
  firstVisible,
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

  if (type === 'history') {
    proposalListTitle = 'Past Proposals'
    isProposalPhase = false
  }
  return (
    <ProposalsView
      listTitle={title || proposalListTitle}
      proposalsList={proposalsList}
      handleItemSelect={handleItemSelect}
      selectedProposal={selectedProposal}
      isProposalPhase={isProposalPhase}
      firstVisible={firstVisible}
    />
  )
}
