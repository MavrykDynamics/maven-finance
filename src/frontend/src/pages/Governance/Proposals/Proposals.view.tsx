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
import { EmptyContainer, GovRightContainerTitleArea } from '../Governance.style'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import { calcWithoutPrecision } from 'utils/calcFunctions'

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
  const {
    governancePhase,
    governanceStorage: { cycle, timelockProposalId, cycleHighestVotedProposalId, cycleCounter },
  } = useSelector((state: State) => state.governance)
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)

  const dropDownOptions = useMemo(() => Array.from({ length: cycle - 1 }, (_, idx) => String(idx + 1)), [cycle])

  const isProposalPhase = governancePhase === 'PROPOSAL'

  const [showWithDroppped, setShowWithDroppped] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState<undefined | string>()
  const [ddIsOpen, setDdIsOpen] = useState(false)

  const { search } = useLocation()
  const currentPage = getPageNumber(search, listName)

  const filteredProposals = useMemo(() => {
    return proposalsList.filter(({ status, cycle }) => {
      if (showWithDroppped && selectedCycle) {
        return status === 0 && cycle === Number(selectedCycle)
      }

      if (showWithDroppped) {
        return status === 0
      }
      if (selectedCycle) {
        return cycle === Number(selectedCycle)
      }

      return true
    })
  }, [showWithDroppped, proposalsList, selectedCycle])

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, listName)
    return filteredProposals.slice(from, to)
  }, [currentPage, filteredProposals, listName])

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
            setShowWithDroppped(!showWithDroppped)
          }}
          checked={showWithDroppped}
          className={'proposal-history-checkbox'}
        >
          <span>Hide dropped proposals</span>
        </Checkbox>
      ) : null}
      {isHistoryPage ? (
        <DropDown
          className="cycle-dropdown"
          placeholder={'Choose cycle number'}
          items={dropDownOptions}
          clickOnDropDown={() => setDdIsOpen(!ddIsOpen)}
          clickOnItem={(value: string) => {
            setSelectedCycle(value)
            setDdIsOpen(false)
          }}
          isOpen={ddIsOpen}
          setIsOpen={setDdIsOpen}
          itemSelected={selectedCycle}
        />
      ) : null}
      {paginatedItemsList.length ? (
        paginatedItemsList.map((proposal, index) => {
          const { statusFlag } = getProposalStatusInfo(
            governancePhase,
            proposal,
            timelockProposalId,
            isProposalPhase,
            cycleHighestVotedProposalId,
            cycleCounter,
          )

          const votedMVK =
            (proposal.abstainMvkTotal ?? 0) + (proposal.downvoteMvkTotal ?? 0) + (proposal.upvoteMvkTotal ?? 0)

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
              {!isProposalPhase && (
                <CommaNumber
                  className="proposal-voted-mvk"
                  value={votedMVK}
                  endingText={'voted MVK'}
                  showDecimal={false}
                />
              )}
              <StatusFlag text={statusFlag} status={statusFlag} />
            </ProposalListItem>
          )
        })
      ) : (
        <EmptyContainer className="empty">
          <img src="/images/not-found.svg" alt=" No proposals to show" />
          <figcaption>
            {selectedCycle
              ? `There was no propoposals on the cycle ${selectedCycle}`
              : 'There are no history proposals'}
          </figcaption>
        </EmptyContainer>
      )}
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
