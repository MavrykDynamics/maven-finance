import React, { useRef, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
/* @ts-ignore */
import Time from 'react-pure-time'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// actions
import {
  getGovernanceStorage,
  proposalRoundVote,
  votingRoundVote,
  getCurrentRoundProposals,
  getTimestampByLevel,
} from './Governance.actions'

// helpers
import { normalizeProposalStatus } from './Governance.helpers'

// view
import { StatusFlag } from '../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../app/App.components/TzAddress/TzAddress.view'
import { GovernancePhase } from '../../reducers/governance'
import { ProposalRecordType, CurrentRoundProposalsStorageType } from '../../utils/TypesAndInterfaces/Governance'
import { VoteStatistics } from './Governance.controller'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import { Proposals } from './Proposals/Proposals.controller'
import { VotingArea } from './VotingArea/VotingArea.controller'
import { calcTimeToBlock } from '../../utils/calcFunctions'
import { Button } from 'app/App.components/Button/Button.controller'

// styles
import {
  GovernanceLeftContainer,
  GovernanceRightContainer,
  GovernanceStyled,
  GovRightContainerTitleArea,
  RightSideSubContent,
  RightSideSubHeader,
} from './Governance.style'
import { EmptyContainer } from '../../app/App.style'

type GovernanceViewProps = {
  ready: boolean
  loading: boolean
  accountPkh: string | undefined
  ongoingProposals: CurrentRoundProposalsStorageType
  nextProposals: CurrentRoundProposalsStorageType
  pastProposals: CurrentRoundProposalsStorageType
  watingProposals: CurrentRoundProposalsStorageType
  governancePhase: GovernancePhase
  userIsSatellite: boolean
  handleOpenModalMoveNextRound: any
  handleExecuteProposal: any
  timeLeftInPhase: Date | number
}

export const GovernanceView = ({
  ready,
  loading,
  accountPkh,
  ongoingProposals,
  nextProposals,
  pastProposals,
  governancePhase,
  userIsSatellite,
  watingProposals,
  handleOpenModalMoveNextRound,
  timeLeftInPhase,
  handleExecuteProposal,
}: GovernanceViewProps) => {
  const dispatch = useDispatch()
  const blockRef = useRef<any>(null)
  const location = useLocation()
  const onProposalHistoryPage = location.pathname === '/proposal-history'
  const [votingEnding, setVotingEnding] = useState<string>('')
  const [rightSideContent, setRightSideContent] = useState<ProposalRecordType | undefined>(undefined)
  const { mvkTokenStorage } = useSelector((state: State) => state.mvkToken)

  const isProposalRound = governancePhase === 'PROPOSAL'
  const isVotingRound = governancePhase === 'VOTING'
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  const [voteStatistics, setVoteStatistics] = useState<VoteStatistics>({
    abstainVotesMVKTotal: Number(rightSideContent?.abstainMvkTotal),
    againstVotesMVKTotal: Number(rightSideContent?.downvoteMvkTotal),
    forVotesMVKTotal: Number(rightSideContent?.upvoteMvkTotal),
    passVotesMVKTotal: Number(rightSideContent?.passVoteMvkTotal),
    unusedVotesMVKTotal:
      mvkTokenStorage.totalSupply -
      (rightSideContent?.abstainMvkTotal ?? 0) +
      (rightSideContent?.downvoteMvkTotal ?? 0) +
      (rightSideContent?.upvoteMvkTotal ?? 0),
  })

  const handleProposalRoundVote = (proposalId: number) => {
    console.log('Here in Proposal round vote', proposalId)
    //TODO: Adjust for the number of votes / voting power each satellite has
    setVoteStatistics({
      ...voteStatistics,
      passVotesMVKTotal: voteStatistics.passVotesMVKTotal + 1,
    })
    dispatch(proposalRoundVote(proposalId))
  }
  const handleVotingRoundVote = (vote: string) => {
    console.log('Here in Vote for Proposal', vote)
    //TODO: Adjust for the number of votes / voting power each satellite has
    let voteType
    switch (vote) {
      case 'FOR':
        voteType = 1
        setVoteStatistics({
          ...voteStatistics,
          forVotesMVKTotal: voteStatistics.forVotesMVKTotal + 1,
        })
        break
      case 'AGAINST':
        voteType = 0
        setVoteStatistics({
          ...voteStatistics,
          againstVotesMVKTotal: voteStatistics.againstVotesMVKTotal + 1,
        })
        break
      case 'ABSTAIN':
      default:
        voteType = 2
        setVoteStatistics({
          ...voteStatistics,
          abstainVotesMVKTotal: voteStatistics.abstainVotesMVKTotal + 1,
        })
        break
    }
    setVoteStatistics({
      ...voteStatistics,
      unusedVotesMVKTotal: voteStatistics.unusedVotesMVKTotal - 1,
    })
    dispatch(votingRoundVote(voteType))
  }

  const _handleItemSelect = (chosenProposal: ProposalRecordType | undefined) => {
    if (chosenProposal) {
      setRightSideContent(chosenProposal)
      if (chosenProposal.passVoteMvkTotal) {
        setVoteStatistics({
          passVotesMVKTotal: Number(chosenProposal.passVoteMvkTotal),
          forVotesMVKTotal: Number(chosenProposal.upvoteMvkTotal),
          againstVotesMVKTotal: Number(chosenProposal.downvoteMvkTotal),
          abstainVotesMVKTotal: Number(chosenProposal.abstainMvkTotal),
          unusedVotesMVKTotal:
            mvkTokenStorage.totalSupply -
            (chosenProposal?.abstainMvkTotal ?? 0) +
            (chosenProposal?.downvoteMvkTotal ?? 0) +
            (chosenProposal?.upvoteMvkTotal ?? 0),
        })
      }
    }
  }

  const emptyContainer = (
    <EmptyContainer>
      <img src="/images/not-found.svg" alt=" No proposals to show" />
      <figcaption> No proposals to show</figcaption>
    </EmptyContainer>
  )

  // TODO correct conditions
  const isVisibleWating = !onProposalHistoryPage && Boolean(watingProposals?.length)
  const isVisibleOngoingVoiting =
    !onProposalHistoryPage && Boolean(ongoingProposals?.length) && governancePhase === 'VOTING'
  const isVisibleOngoingTimeLock =
    !onProposalHistoryPage && Boolean(ongoingProposals?.length) && governancePhase === 'TIME_LOCK'
  const isVisibleNextProposal =
    !onProposalHistoryPage && Boolean(nextProposals?.length) && governancePhase === 'PROPOSAL'
  const isVisibleHistoryProposal = onProposalHistoryPage && Boolean(pastProposals?.length)
  const isExecuted = rightSideContent?.executed
  const isMinusLeftTime = timeLeftInPhase <= 0
  const isExecuteProposal =
    !isExecuted && isMinusLeftTime && accountPkh && !isProposalRound && !isVotingRound && !isTimeLockRound

  const [visibleLists, setVisibleLists] = useState<Record<string, boolean>>({
    wating: false,
    ongoingVoiting: false,
    ongoingTimeLock: false,
    next: false,
    history: false,
  })

  const rightSideContentStatus = normalizeProposalStatus(
    governancePhase,
    rightSideContent?.status ?? 0,
    Boolean(rightSideContent?.executed),
    Boolean(rightSideContent?.locked),
    !isVisibleHistoryProposal,
  )

  const [firstVisibleProposal, setFirstVisibleProposal] = useState<string>('')
  const someVisible = Object.values(visibleLists).some((item) => item)

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

  const handleGetTimestampByLevel = async (level: number) => {
    const res = await getTimestampByLevel(level)
    setVotingEnding(res)
  }
  const handleClickExecuteProposal = () => {
    if (rightSideContent?.id) {
      handleOpenModalMoveNextRound(rightSideContent.id)
    }
  }

  useEffect(() => {
    handleGetTimestampByLevel(rightSideContent?.currentCycleEndLevel ?? 0)
  }, [rightSideContent?.currentCycleEndLevel])

  useEffect(() => {
    if (!someVisible) {
      setRightSideContent(undefined)
    }
  }, [someVisible])

  const timeNow = Date.now()
  const votingTime = new Date(votingEnding).getTime()
  const isEndedVotingTime = votingTime < timeNow

  return (
    <GovernanceStyled>
      {someVisible ? (
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
      ) : (
        emptyContainer
      )}
      {rightSideContent && rightSideContent.id !== 0 ? (
        <GovernanceRightContainer>
          <GovRightContainerTitleArea>
            <h1>{rightSideContent.title}</h1>
            <StatusFlag text={rightSideContentStatus} status={rightSideContentStatus} />
          </GovRightContainerTitleArea>
          {votingEnding ? (
            <RightSideSubContent id="votingDeadline">
              Voting {isEndedVotingTime ? 'ended' : 'ending'} on <Time value={votingEnding} format="F d\t\h, H:m" />{' '}
              CEST
            </RightSideSubContent>
          ) : null}

          <div className="voting-proposal">
            <VotingArea
              ready={ready}
              loading={loading}
              accountPkh={accountPkh}
              handleProposalRoundVote={handleProposalRoundVote}
              handleVotingRoundVote={handleVotingRoundVote}
              selectedProposal={rightSideContent}
              voteStatistics={voteStatistics}
              isVisibleHistoryProposal={isVisibleHistoryProposal}
            />

            {isExecuteProposal ? (
              <Button
                className="execute-proposal"
                text="Execute Proposal"
                onClick={handleClickExecuteProposal}
                kind="actionPrimary"
                loading={loading}
              />
            ) : null}
          </div>
          <hr />
          {rightSideContent.details ? (
            <article>
              <RightSideSubHeader>Details</RightSideSubHeader>
              <RightSideSubContent>{rightSideContent.details}</RightSideSubContent>
            </article>
          ) : null}

          {rightSideContent.description ? (
            <article>
              <RightSideSubHeader>Description</RightSideSubHeader>
              <RightSideSubContent>{rightSideContent.description}</RightSideSubContent>
            </article>
          ) : null}

          {rightSideContent.proposerId ? (
            <article>
              <RightSideSubHeader>Proposer</RightSideSubHeader>
              <RightSideSubContent>
                <TzAddress tzAddress={rightSideContent.proposerId} hasIcon={true} isBold={true} />
              </RightSideSubContent>
            </article>
          ) : null}

          {/* <article>
            <a target="_blank" rel="noopener noreferrer" href={rightSideContent.invoice}>
              <p>Invoice</p>
            </a>
          </article> */}
          {/*<Table tableData={selectedProposal.invoiceTable} />*/}
        </GovernanceRightContainer>
      ) : null}
    </GovernanceStyled>
  )
}
