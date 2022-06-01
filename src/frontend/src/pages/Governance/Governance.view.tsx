import React, { useRef, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { StatusFlag } from '../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../app/App.components/TzAddress/TzAddress.view'
import { EmptyContainer } from '../../app/App.style'
import { GovernancePhase } from '../../reducers/governance'
import { ProposalRecordType, CurrentRoundProposalsStorageType } from '../../utils/TypesAndInterfaces/Governance'
import { VoteStatistics } from './Governance.controller'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'

import {
  GovernanceLeftContainer,
  GovernanceRightContainer,
  GovernanceStyled,
  GovRightContainerTitleArea,
  RightSideSubContent,
  RightSideSubHeader,
} from './Governance.style'
import { Proposals } from './Proposals/Proposals.controller'
import { VotingArea } from './VotingArea/VotingArea.controller'
import { calcTimeToBlock } from '../../utils/calcFunctions'
import { Button } from 'app/App.components/Button/Button.controller'

type GovernanceViewProps = {
  ready: boolean
  loading: boolean
  accountPkh: string | undefined
  ongoingProposals?: CurrentRoundProposalsStorageType
  nextProposals: CurrentRoundProposalsStorageType
  pastProposals?: CurrentRoundProposalsStorageType
  watingProposals?: CurrentRoundProposalsStorageType
  governancePhase: GovernancePhase
  handleProposalRoundVote: (proposalId: number) => void
  handleVotingRoundVote: (vote: string) => void
  setVoteStatistics: (voteStatistics: VoteStatistics) => void
  selectedProposal: ProposalRecordType | undefined
  voteStatistics: VoteStatistics
  userIsSatellite: boolean
}

export const GovernanceView = ({
  ready,
  loading,
  accountPkh,
  ongoingProposals,
  nextProposals,
  pastProposals,
  governancePhase,
  handleProposalRoundVote,
  handleVotingRoundVote,
  setVoteStatistics,
  selectedProposal,
  voteStatistics,
  userIsSatellite,
  watingProposals,
}: GovernanceViewProps) => {
  const blockRef = useRef<any>(null)
  const location = useLocation()
  const onProposalHistoryPage = location.pathname === '/proposal-history'
  const [selectedProposalToShow, setSelectedProposalToShow] = useState<number>(Number(selectedProposal?.id || 1))
  const [rightSideContent, setRightSideContent] = useState<ProposalRecordType | undefined>(undefined)
  const isProposalPhase = governancePhase === 'PROPOSAL'

  const _handleItemSelect = (chosenProposal: ProposalRecordType | undefined) => {
    if (chosenProposal) {
      setSelectedProposalToShow(
        chosenProposal.id === selectedProposalToShow ? selectedProposalToShow : chosenProposal.id,
      )
      setRightSideContent(chosenProposal)
      setVoteStatistics({
        passVotesMVKTotal: Number(chosenProposal.passVoteMvkTotal),
        forVotesMVKTotal: Number(chosenProposal.upvoteMvkTotal),
        againstVotesMVKTotal: Number(chosenProposal.downvoteMvkTotal),
        abstainVotesMVKTotal: Number(chosenProposal.abstainMvkTotal),
        //TODO: Correct calculation for unused votes count
        unusedVotesMVKTotal: Number(chosenProposal.passVoteMvkTotal),
      })
    }
  }

  const emptyContainer = (
    <EmptyContainer>
      <img src="/images/not-found.svg" alt=" No proposals to show" />
      <figcaption> No proposals to show</figcaption>
    </EmptyContainer>
  )
  console.log('%c ||||| rightSideContent', 'color:yellowgreen', rightSideContent)

  const days = calcTimeToBlock(
    rightSideContent?.currentCycleStartLevel || 0,
    rightSideContent?.currentCycleEndLevel || 0,
  )

  // TODO correct conditions
  const isVisibleWating = !onProposalHistoryPage && watingProposals !== undefined
  const isVisibleOngoingVoiting =
    !onProposalHistoryPage && ongoingProposals !== undefined && governancePhase === 'VOTING'
  const isVisibleOngoingTimeLock =
    !onProposalHistoryPage && ongoingProposals !== undefined && governancePhase === 'TIME_LOCK'
  const isVisibleNextProposal = !onProposalHistoryPage && nextProposals !== undefined && governancePhase === 'PROPOSAL'
  const isVisibleHistoryProposal = onProposalHistoryPage && pastProposals !== undefined

  const [visibleLists, setVisibleLists] = useState<Record<string, boolean>>({
    wating: false,
    ongoingVoiting: false,
    ongoingTimeLock: false,
    next: false,
    history: false,
  })

  const [firstVisibleProposal, setFirstVisibleProposal] = useState<string>('')

  useEffect(() => {
    const visibleTypes: Record<string, boolean> = {
      wating: isVisibleWating,
      ongoingVoiting: isVisibleOngoingVoiting,
      ongoingTimeLock: isVisibleOngoingTimeLock,
      next: isVisibleNextProposal,
      history: isVisibleHistoryProposal,
    }
    setVisibleLists(visibleTypes)

    const firstVisible: string = Object.keys(visibleTypes).find((key: string) => Boolean(visibleTypes[key])) as string
    setFirstVisibleProposal(firstVisible)
  }, [
    isVisibleWating,
    isVisibleOngoingVoiting,
    isVisibleOngoingTimeLock,
    isVisibleNextProposal,
    isVisibleHistoryProposal,
  ])

  return (
    <GovernanceStyled>
      <GovernanceLeftContainer ref={blockRef}>
        {isVisibleWating && (
          <Proposals
            proposalsList={watingProposals}
            handleItemSelect={_handleItemSelect}
            selectedProposal={rightSideContent}
            title="Waiting for Execution"
            type="wating"
            firstVisible={firstVisibleProposal === 'wating'}
          />
        )}
        {isVisibleOngoingVoiting && (
          <Proposals
            proposalsList={ongoingProposals}
            handleItemSelect={_handleItemSelect}
            selectedProposal={rightSideContent}
            type="ongoingVoiting"
            firstVisible={firstVisibleProposal === 'ongoingVoiting'}
          />
        )}
        {isVisibleOngoingTimeLock && (
          <Proposals
            proposalsList={ongoingProposals}
            handleItemSelect={_handleItemSelect}
            selectedProposal={rightSideContent}
            type="ongoingTimeLock"
            firstVisible={firstVisibleProposal === 'ongoingTimeLock'}
          />
        )}
        {isVisibleNextProposal && (
          <Proposals
            proposalsList={nextProposals}
            handleItemSelect={_handleItemSelect}
            selectedProposal={rightSideContent}
            type="next"
            firstVisible={firstVisibleProposal === 'next'}
          />
        )}
        {isVisibleHistoryProposal && (
          <Proposals
            proposalsList={pastProposals}
            handleItemSelect={_handleItemSelect}
            selectedProposal={rightSideContent}
            type="history"
            firstVisible={firstVisibleProposal === 'history'}
          />
        )}
      </GovernanceLeftContainer>

      {rightSideContent && rightSideContent.id !== 0 ? (
        <GovernanceRightContainer>
          <GovRightContainerTitleArea>
            <h1>{rightSideContent.title}</h1>
            <StatusFlag text={rightSideContent.status} status={rightSideContent.status} />
          </GovRightContainerTitleArea>
          <RightSideSubContent id="votingDeadline">Voting ending on September 12th, 05:16 CEST</RightSideSubContent>
          <VotingArea
            ready={ready}
            loading={loading}
            accountPkh={accountPkh}
            handleProposalRoundVote={handleProposalRoundVote}
            handleVotingRoundVote={handleVotingRoundVote}
            selectedProposal={rightSideContent}
            voteStatistics={voteStatistics}
          />
          <hr />
          <article>
            <RightSideSubHeader>Details</RightSideSubHeader>
            <RightSideSubContent>{rightSideContent.details}</RightSideSubContent>
          </article>
          <article>
            <RightSideSubHeader>Description</RightSideSubHeader>
            <RightSideSubContent>{rightSideContent.description}</RightSideSubContent>
          </article>
          <article>
            <RightSideSubHeader>Proposer</RightSideSubHeader>
            <RightSideSubContent>
              <TzAddress tzAddress={rightSideContent.proposerId} hasIcon={true} isBold={true} />
            </RightSideSubContent>
          </article>
          <article>
            <a target="_blank" rel="noopener noreferrer" href={rightSideContent.invoice}>
              <p>Invoice</p>
            </a>
          </article>
          {/*<Table tableData={selectedProposal.invoiceTable} />*/}
        </GovernanceRightContainer>
      ) : null}
    </GovernanceStyled>
  )
}
