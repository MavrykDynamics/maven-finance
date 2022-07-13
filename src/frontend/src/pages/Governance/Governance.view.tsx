import React, { useRef, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
/* @ts-ignore */
import Time from 'react-pure-time'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import type { ProposalDataType, ProposalPaymentType } from '../../utils/TypesAndInterfaces/Governance'

// actions
import {
  getGovernanceStorage,
  proposalRoundVote,
  votingRoundVote,
  getCurrentRoundProposals,
  getTimestampByLevel,
  processProposalPayment,
} from './Governance.actions'

// helpers
import {
  normalizeProposalStatus,
  normalizeTokenStandart,
  getShortByte,
  getProposalStatusInfo,
} from './Governance.helpers'
import { calcWithoutPrecision, calcWithoutMu } from '../../utils/calcFunctions'

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
import { TableGridWrap } from '../../app/App.components/TableGrid/TableGrid.style'
import {
  WAITING_PROPOSALS_LIST_NAME,
  WAITING_FOR_PAYMENT_PROPOSALS_LIST_NAME,
  ONGOING_VOTING_PROPOSALS_LIST_NAME,
  ONGOING_PROPOSALS_LIST_NAME,
  NEXT_PROPOSALS_LIST_NAME,
  HISTORY_PROPOSALS_LIST_NAME,
} from 'pages/FinacialRequests/Pagination/pagination.consts'

type GovernanceViewProps = {
  ready: boolean
  loading: boolean
  accountPkh: string | undefined
  ongoingProposals: CurrentRoundProposalsStorageType
  nextProposals: CurrentRoundProposalsStorageType
  pastProposals: CurrentRoundProposalsStorageType
  watingProposals: CurrentRoundProposalsStorageType
  waitingForPaymentToBeProcessed: CurrentRoundProposalsStorageType
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
  waitingForPaymentToBeProcessed,
}: GovernanceViewProps) => {
  const dispatch = useDispatch()
  const blockRef = useRef<any>(null)
  const location = useLocation()
  const onProposalHistoryPage = location.pathname === '/proposal-history'
  const [votingEnding, setVotingEnding] = useState<string>('')
  const [rightSideContent, setRightSideContent] = useState<ProposalRecordType | undefined>(undefined)
  const { mvkTokenStorage } = useSelector((state: State) => state.mvkToken)
  const { governanceStorage } = useSelector((state: State) => state.governance)

  const isProposalRound = governancePhase === 'PROPOSAL'
  const isVotingRound = governancePhase === 'VOTING'
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  const [voteStatistics, setVoteStatistics] = useState<VoteStatistics>({
    abstainVotesMVKTotal: 0,
    againstVotesMVKTotal: 0,
    forVotesMVKTotal: 0,
    passVotesMVKTotal: 0,
    unusedVotesMVKTotal: 0,
  })

  useEffect(() => {
    setVoteStatistics({
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
  }, [mvkTokenStorage.totalSupply, rightSideContent])

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
        voteType = 'yay'
        setVoteStatistics({
          ...voteStatistics,
          forVotesMVKTotal: voteStatistics.forVotesMVKTotal + 1,
        })
        break
      case 'AGAINST':
        voteType = 'nay'
        setVoteStatistics({
          ...voteStatistics,
          againstVotesMVKTotal: voteStatistics.againstVotesMVKTotal + 1,
        })
        break
      case 'ABSTAIN':
      default:
        voteType = 'abstain'
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

  const handleClickProcessPayment = () => {
    if (rightSideContent?.id) dispatch(processProposalPayment(rightSideContent.id))
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

  const isVisibleOngoingVoiting =
    !onProposalHistoryPage && Boolean(ongoingProposals?.length) && governancePhase === 'VOTING'

  const isVisibleOngoingTimeLock =
    !onProposalHistoryPage && Boolean(ongoingProposals?.length) && governancePhase === 'TIME_LOCK'
  const isVisibleNextProposal =
    !onProposalHistoryPage && Boolean(nextProposals?.length) && governancePhase === 'PROPOSAL'
  const isVisibleHistoryProposal = onProposalHistoryPage && Boolean(pastProposals?.length)
  const isExecuted = rightSideContent?.executed
  const isMinusLeftTime = timeLeftInPhase <= 0

  const [visibleLists, setVisibleLists] = useState<Record<string, boolean>>({
    wating: false,
    ongoingVoiting: false,
    ongoingTimeLock: false,
    next: false,
    history: false,
  })

  const statusInfo = getProposalStatusInfo(
    governancePhase,
    rightSideContent,
    governanceStorage.timelockProposalId,
    !onProposalHistoryPage,
    governanceStorage.cycleHighestVotedProposalId,
    governanceStorage.cycleCounter,
  )

  const isExecuteProposal = statusInfo.anyUserCanExecuteProposal && accountPkh
  const isPaymentProposal = statusInfo.anyUserCanProcessProposalPayment && accountPkh
  const isVisibleWating = !onProposalHistoryPage && Boolean(watingProposals?.length)
  const isVisibleWatingPayment = !onProposalHistoryPage && Boolean(waitingForPaymentToBeProcessed?.length)
  const isAbleToMakeProposalRoundVote = statusInfo.satelliteAbleToMakeProposalRoundVote

  const rightSideContentStatus = statusInfo.statusFlag

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

  // console.log('%c ||||| rightSideContent', 'color:yellowgreen', rightSideContent)

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
              listName={WAITING_PROPOSALS_LIST_NAME}
            />
          )}
          {isVisibleWatingPayment && (
            <Proposals
              proposalsList={waitingForPaymentToBeProcessed}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              title="Waiting For Payment To Be Processed"
              type="wating"
              firstVisible={firstVisibleProposal === 'wating'}
              listName={WAITING_FOR_PAYMENT_PROPOSALS_LIST_NAME}
            />
          )}
          {isVisibleOngoingVoiting && (
            <Proposals
              proposalsList={ongoingProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              type="ongoingVoiting"
              firstVisible={firstVisibleProposal === 'ongoingVoiting'}
              listName={ONGOING_VOTING_PROPOSALS_LIST_NAME}
            />
          )}
          {isVisibleOngoingTimeLock && (
            <Proposals
              proposalsList={ongoingProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              type="ongoingTimeLock"
              firstVisible={firstVisibleProposal === 'ongoingTimeLock'}
              listName={ONGOING_PROPOSALS_LIST_NAME}
            />
          )}
          {isVisibleNextProposal && (
            <Proposals
              proposalsList={nextProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              type="next"
              firstVisible={firstVisibleProposal === 'next'}
              listName={NEXT_PROPOSALS_LIST_NAME}
            />
          )}
          {isVisibleHistoryProposal && (
            <Proposals
              proposalsList={pastProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              type="history"
              firstVisible={firstVisibleProposal === 'history'}
              listName={HISTORY_PROPOSALS_LIST_NAME}
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
              isAbleToMakeProposalRoundVote={isAbleToMakeProposalRoundVote}
              isEndedVotingTime={isEndedVotingTime}
            />
            {isExecuteProposal ? (
              <Button
                className="execute-proposal"
                text="Execute Proposal"
                onClick={handleClickExecuteProposal}
                kind="actionPrimary"
              />
            ) : null}
            {isPaymentProposal ? (
              <Button
                className="execute-proposal"
                text="Process Payment"
                onClick={handleClickProcessPayment}
                kind="actionPrimary"
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

          <article>
            <RightSideSubHeader>Source Code</RightSideSubHeader>
            <RightSideSubContent>{rightSideContent.sourceCode || 'No link to source code given'}</RightSideSubContent>
          </article>

          <article>
            <RightSideSubHeader>Meta-Data</RightSideSubHeader>
            {rightSideContent.proposalData?.length ? (
              <ol className="proposal-list">
                {rightSideContent.proposalData.map((item: ProposalDataType, i: number) => {
                  const unique = `proposalDataItem${item.id}`
                  return (
                    <li key={item.id}>
                      <div>
                        <div>
                          <b className="proposal-list-title">Title: </b>
                          <span className="proposal-list-title-valie">{item.title}</span>
                        </div>
                        <div>
                          <b className="proposal-list-title">Bytes: </b>
                          <span className="proposal-list-bites">
                            <input type="checkbox" className="byte-input" id={unique} />
                            <span className="byte">
                              {item.bytes} <label htmlFor={unique}>hide</label>
                            </span>
                            <span className="short-byte">
                              {getShortByte(item.bytes)} <label htmlFor={unique}>see all</label>
                            </span>
                          </span>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <RightSideSubContent>No proposal meta-data given</RightSideSubContent>
            )}
          </article>

          <article className="payment-data">
            <RightSideSubHeader>Payment Data</RightSideSubHeader>
            {rightSideContent.proposalPayments?.length ? (
              <TableGridWrap>
                <div className="table-wrap">
                  <table>
                    <tr>
                      <td>Address</td>
                      <td>Title</td>
                      <td>Amount</td>
                      <td>Payment Type (XTZ/MVK)</td>
                    </tr>
                    {rightSideContent.proposalPayments.map((item: ProposalPaymentType, i: number) => {
                      const paymentType = normalizeTokenStandart(item.token_standard, item.token_address, item.token_id)

                      const amount =
                        paymentType === 'MVK'
                          ? calcWithoutPrecision(item.token_amount)
                          : calcWithoutMu(item.token_amount)

                      return (
                        <tr key={item.id}>
                          <td>
                            <TzAddress tzAddress={item.to__id} hasIcon={false} isBold={true} />
                          </td>
                          <td>{item.title}</td>
                          <td>{amount}</td>
                          <td>{paymentType}</td>
                        </tr>
                      )
                    })}
                  </table>
                </div>
              </TableGridWrap>
            ) : (
              <RightSideSubContent>No payment data given</RightSideSubContent>
            )}
          </article>

          {rightSideContent.proposerId ? (
            <article>
              <RightSideSubHeader>Proposer</RightSideSubHeader>
              <RightSideSubContent>
                <TzAddress tzAddress={rightSideContent.proposerId} hasIcon={true} isBold={true} />
              </RightSideSubContent>
            </article>
          ) : null}

          {rightSideContent.governanceId ? (
            <article>
              <h4>Governance Info</h4>
              <div className="governance-contract">
                <p>Governance Contract</p>
                <TzAddress tzAddress={rightSideContent.governanceId} hasIcon={false} isBold={true} />
              </div>
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
