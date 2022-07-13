import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// helpers
import { getProposalStatusInfo } from '../Governance.helpers'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'

// view
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { ProposalRecordType } from '../../../utils/TypesAndInterfaces/Governance'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'

// style
import { ProposalItemLeftSide, ProposalListContainer, ProposalListItem } from './Proposals.style'
import { calculateSlicePositions, LIST_NAMES_MAPPER } from 'pages/FinacialRequests/Pagination/pagination.consts'

type ProposalsViewProps = {
  listTitle: string
  proposalsList: ProposalRecordType[]
  handleItemSelect: (proposalListItem: ProposalRecordType | undefined) => void
  selectedProposal: ProposalRecordType | undefined
  isProposalPhase: boolean
  firstVisible: boolean
  listName: string
}
export const ProposalsView = ({
  listTitle,
  proposalsList,
  handleItemSelect,
  selectedProposal,
  isProposalPhase,
  firstVisible,
  listName,
}: ProposalsViewProps) => {
  const { governancePhase, governanceStorage } = useSelector((state: State) => state.governance)
  const location = useLocation()

  useEffect(() => {
    if (firstVisible) handleItemSelect(proposalsList[0])
  }, [proposalsList, firstVisible])

  useEffect(() => {
    handleItemSelect(undefined)
  }, [location.pathname, proposalsList])

  const proposalsDuplicated: ProposalRecordType[] = []
  let proposalListCounter = 0
  while (proposalsDuplicated.length < 50) {
    if (proposalListCounter < ProposalListContainer.length) {
      proposalListCounter++
    } else {
      proposalListCounter = 0
    }

    proposalsDuplicated.push(proposalsList[proposalListCounter])
  }

  const { pathname, search } = useLocation()
  const currentPage = getPageNumber(search, listName)

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, listName)
    return proposalsDuplicated.slice(from, to)
  }, [currentPage, proposalsDuplicated])

  if (!proposalsList.length) {
    return null
  }

  return (
    <ProposalListContainer>
      <h1>{listTitle}</h1>
      {paginatedItemsList.length &&
        paginatedItemsList.map((proposal, index) => {
          const statusInfo = getProposalStatusInfo(
            governancePhase,
            proposal,
            governanceStorage.timelockProposalId,
            isProposalPhase,
            governanceStorage.cycleHighestVotedProposalId,
            governanceStorage.cycleCounter,
          )

          const contentStatus = statusInfo.statusFlag

          const dividedPassVoteMvkTotal = proposal.passVoteMvkTotal ? proposal.passVoteMvkTotal / 1_000_000_000 : 0
          return (
            <ProposalListItem
              key={proposal.id}
              onClick={() => handleItemSelect(proposal)}
              selected={selectedProposal ? selectedProposal.id === proposal.id : proposal.id === 1}
            >
              <ProposalItemLeftSide>
                <span>{index + 1 + (Number(currentPage) - 1) * LIST_NAMES_MAPPER[listName]}</span>
                <h4>{proposal.title}</h4>
              </ProposalItemLeftSide>
              {isProposalPhase && (
                <CommaNumber className="proposal-voted-mvk" value={dividedPassVoteMvkTotal} endingText={'voted MVK'} />
              )}
              <StatusFlag text={contentStatus} status={contentStatus} />
            </ProposalListItem>
          )
        })}
      <Pagination itemsCount={proposalsDuplicated.length} listName={listName} />
    </ProposalListContainer>
  )
}
