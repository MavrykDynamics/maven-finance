import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// helpers
import { getProposalStatusInfo } from '../Governance.helpers'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'

// view
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { ProposalRecordType, ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'

// style
import {
  ProposalItemLeftSide,
  ProposalListContainer,
  ProposalListItem,
  VoterListItem,
  ProposalStatusFlag,
} from './Proposals.style'
import {
  calculateSlicePositions,
  GOVERNANCE_VOTERS_LIST_NAME,
  LIST_NAMES_MAPPER,
} from 'pages/FinacialRequests/Pagination/pagination.consts'
import { GovRightContainerTitleArea } from '../Governance.style'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'

type ProposalsViewProps = {
  listTitle: string
  proposalsList: ProposalRecordType[]
  handleItemSelect: (proposalListItem: ProposalRecordType | undefined) => void
  selectedProposal: ProposalRecordType | undefined
  listName: string
  showVotersList: boolean
  isHistoryPage: boolean
}
export const ProposalsView = ({
  listTitle,
  proposalsList,
  handleItemSelect,
  selectedProposal,
  listName,
  showVotersList,
  isHistoryPage,
}: ProposalsViewProps) => {
  const { governancePhase, governanceStorage } = useSelector((state: State) => state.governance)
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)

  const isProposalPhase = governancePhase === 'PROPOSAL'

  const [showAllProposals, setShowAllProposals] = useState(true)

  const { search } = useLocation()
  const currentPage = getPageNumber(search, listName)

  const filteredProposals = useMemo(() => {
    if (showAllProposals) {
      return proposalsList.filter(({ status }) => status === 0)
    }

    return proposalsList
  }, [showAllProposals])

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, listName)
    return filteredProposals.slice(from, to)
  }, [currentPage, filteredProposals])

  const votersList = useMemo(
    () =>
      selectedProposal?.votes?.reduce<
        Array<{
          vote: number
          name: string
          avatar: string
          address: string
        }>
      >((acc, { voter_id, round, vote }) => {
        const satelliteData = satelliteLedger?.find(({ address }) => address === voter_id)

        if (satelliteData && round === 1) {
          acc.push({
            vote,
            name: satelliteData.name,
            avatar: satelliteData.image,
            address: voter_id,
          })
        }

        return acc
      }, []),
    [satelliteLedger, selectedProposal],
  )

  return (
    <ProposalListContainer>
      <GovRightContainerTitleArea>
        <h1>{listTitle}</h1>
      </GovRightContainerTitleArea>
      {isHistoryPage ? (
        <Checkbox
          id={'show_dropped'}
          onChangeHandler={() => {
            setShowAllProposals(!showAllProposals)
          }}
          checked={showAllProposals}
          className={'proposal-history-checkbox'}
        >
          <span>Hide dropped proposals</span>
        </Checkbox>
      ) : null}
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
      <Pagination itemsCount={proposalsList.length} listName={listName} />
      {showVotersList && votersList?.length ? (
        <div className="voters-list">
          <GovRightContainerTitleArea>
            <h1>Satellite Voting History</h1>
          </GovRightContainerTitleArea>
          {votersList.map(({ vote, address, name, avatar }) => {
            const status = vote === 1 ? ProposalStatus.EXECUTED : vote === -1 ? ProposalStatus.DEFEATED : undefined
            const statusText = vote === 1 ? 'YES' : vote === -1 ? 'NO' : 'PASS'
            return (
              <VoterListItem>
                <div className="left">
                  <div className="avatar">
                    <img src={avatar} alt={`${name} avatar`} />
                  </div>
                  <div className="info">
                    <span>{name}</span>
                    <TzAddress tzAddress={address} />
                  </div>
                </div>
                <ProposalStatusFlag status={status}>{statusText}</ProposalStatusFlag>
              </VoterListItem>
            )
          })}
          <Pagination itemsCount={votersList.length} listName={GOVERNANCE_VOTERS_LIST_NAME} />
        </div>
      ) : null}
    </ProposalListContainer>
  )
}
