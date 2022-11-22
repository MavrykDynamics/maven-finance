import React, { useEffect, useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import {
  ProposalRecordType,
  ProposalStatus,
  CurrentRoundProposalsStorageType,
  GovPhases,
} from '../../utils/TypesAndInterfaces/Governance'
import type { Governance_Proposal_Payment, Maybe } from '../../utils/generated/graphqlTypes'
import { VoteStatistics } from 'app/App.components/VotingArea/helpers/voting'

// actions
import { proposalRoundVote, getTimestampByLevel, processProposalPayment, votingRoundVote } from './Governance.actions'
import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { VotingProposalsArea } from '../../app/App.components/VotingArea/VotingArea.controller'

// helpers
import { getShortByte, getProposalStatusInfo } from './Governance.helpers'
import { calcWithoutPrecision, calcWithoutMu } from '../../utils/calcFunctions'
import {
  WAITING_PROPOSALS_LIST_NAME,
  WAITING_FOR_PAYMENT_PROPOSALS_LIST_NAME,
  ONGOING_VOTING_PROPOSALS_LIST_NAME,
  ONGOING_PROPOSALS_LIST_NAME,
  NEXT_PROPOSALS_LIST_NAME,
  HISTORY_PROPOSALS_LIST_NAME,
} from 'pages/FinacialRequests/Pagination/pagination.consts'
import { PRECISION_NUMBER } from 'utils/constants'
import { dropProposal } from '../ProposalSubmission/ProposalSubmission.actions'
import { parseDate } from 'utils/time'

// components
import Icon from '../../app/App.components/Icon/Icon.view'
import { StatusFlag } from '../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../app/App.components/TzAddress/TzAddress.view'
import { GovernancePhase } from '../../reducers/governance'
import { Proposals } from './Proposals/Proposals.controller'
import { Button } from 'app/App.components/Button/Button.controller'

// styles
import {
  GovernanceLeftContainer,
  GovernanceRightContainer,
  GovernanceStyled,
  GovRightContainerTitleArea,
  RightSideSubContent,
  RightSideSubHeader,
  EmptyContainer,
} from './Governance.style'
import { InfoBlock } from '../../app/App.components/Info/info.style'
import { TableGridWrap } from '../../app/App.components/TableGrid/TableGrid.style'

type GovernanceViewProps = {
  accountPkh: string | undefined
  ongoingProposals: CurrentRoundProposalsStorageType
  nextProposals: CurrentRoundProposalsStorageType
  pastProposals: CurrentRoundProposalsStorageType
  watingProposals: CurrentRoundProposalsStorageType
  waitingForPaymentToBeProcessed: CurrentRoundProposalsStorageType
  governancePhase: GovernancePhase
  userIsSatellite: boolean
  handleExecuteProposal: (arg: number) => void
}

const emptyContainer = (
  <EmptyContainer className="empty">
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No proposals to show</figcaption>
  </EmptyContainer>
)

export const GovernanceView = ({
  accountPkh,
  ongoingProposals,
  nextProposals,
  pastProposals,
  governancePhase,
  userIsSatellite,
  watingProposals,
  handleExecuteProposal,
  waitingForPaymentToBeProcessed,
}: GovernanceViewProps) => {
  const dispatch = useDispatch()
  const { pathname } = useLocation()

  const { governanceStorage, currentRoundProposals } = useSelector((state: State) => state.governance)
  const { dipDupTokens } = useSelector((state: State) => state.tokens)

  const [votingEnding, setVotingEnding] = useState<string>('')
  const [visibleMeta, setVisibleMeta] = useState<string>('')
  const [rightSideContent, setRightSideContent] = useState<ProposalRecordType | undefined>(undefined)
  const [voteStatistics, setVoteStatistics] = useState<VoteStatistics>({
    abstainVotesMVKTotal: 0,
    againstVotesMVKTotal: 0,
    forVotesMVKTotal: 0,
    unusedVotesMVKTotal: 0,
    quorum: 0,
  })

  const onProposalHistoryPage = useMemo(() => pathname === '/proposal-history', [pathname])

  useEffect(() => {
    if (rightSideContent) {
      setVoteStatistics({
        abstainVotesMVKTotal: Number(rightSideContent.abstainMvkTotal),
        againstVotesMVKTotal: Number(rightSideContent.downvoteMvkTotal),
        forVotesMVKTotal: Number(rightSideContent.upvoteMvkTotal),
        unusedVotesMVKTotal: Math.round(
          rightSideContent.quorumMvkTotal / PRECISION_NUMBER -
            rightSideContent.abstainMvkTotal -
            rightSideContent.downvoteMvkTotal -
            rightSideContent.upvoteMvkTotal,
        ),
        quorum: rightSideContent.minQuorumPercentage,
      })
    }
  }, [rightSideContent, currentRoundProposals])

  const handleProposalRoundVote = (proposalId: number) => {
    //TODO: Adjust for the number of votes * voting power each satellite has
    setVoteStatistics({
      ...voteStatistics,
      unusedVotesMVKTotal: voteStatistics.unusedVotesMVKTotal - 1,
      forVotesMVKTotal: voteStatistics.forVotesMVKTotal + 1,
    })
    dispatch(proposalRoundVote(proposalId))
  }

  const handleVotingRoundVote = (vote: string) => {
    let voteType
    switch (vote) {
      case 'yay':
        voteType = 'yay'
        setVoteStatistics({
          ...voteStatistics,
          forVotesMVKTotal: +voteStatistics.forVotesMVKTotal + 1,
          unusedVotesMVKTotal: Math.max(+voteStatistics.unusedVotesMVKTotal - 1, 0),
        })
        break
      case 'nay':
        voteType = 'nay'
        setVoteStatistics({
          ...voteStatistics,
          againstVotesMVKTotal: Number(voteStatistics.againstVotesMVKTotal) + 1,
          unusedVotesMVKTotal: Math.max(+voteStatistics.unusedVotesMVKTotal - 1, 0),
        })
        break
      case 'pass':
        voteType = 'abstain'
        setVoteStatistics({
          ...voteStatistics,
          abstainVotesMVKTotal: Number(voteStatistics.abstainVotesMVKTotal) + 1,
          unusedVotesMVKTotal: Math.max(+voteStatistics.unusedVotesMVKTotal - 1, 0),
        })
        break
      default:
        return
    }

    dispatch(votingRoundVote(voteType))
  }

  const handleClickProcessPayment = () => {
    if (rightSideContent?.id) dispatch(processProposalPayment(rightSideContent.id))
  }

  const _handleItemSelect = (chosenProposal: ProposalRecordType | undefined) => {
    setRightSideContent(chosenProposal)
  }

  const isVisibleOngoingVoting =
    !onProposalHistoryPage && Boolean(ongoingProposals?.length) && governancePhase === 'VOTING'
  const isVisibleOngoingTimeLock =
    !onProposalHistoryPage && Boolean(ongoingProposals?.length) && governancePhase === 'TIME_LOCK'
  const isVisibleNextProposal =
    !onProposalHistoryPage && Boolean(nextProposals?.length) && governancePhase === 'PROPOSAL'
  const isVisibleHistoryProposal = onProposalHistoryPage && Boolean(pastProposals?.length)

  const [visibleLists, setVisibleLists] = useState<Record<string, boolean>>({
    wating: false,
    ongoingVoiting: false,
    ongoingTimeLock: false,
    next: false,
    history: false,
  })

  const {
    statusFlag,
    anyUserCanExecuteProposal,
    anyUserCanProcessProposalPayment,
    satelliteAbleToMakeProposalRoundVote,
  } = getProposalStatusInfo(
    governancePhase,
    rightSideContent,
    governanceStorage.timelockProposalId,
    !onProposalHistoryPage,
    governanceStorage.cycleHighestVotedProposalId,
    governanceStorage.cycleCounter,
  )

  const isExecuteProposal = anyUserCanExecuteProposal && accountPkh
  const isPaymentProposal = anyUserCanProcessProposalPayment && accountPkh
  const isVisibleWating = !onProposalHistoryPage && Boolean(watingProposals?.length)
  const isVisibleWatingPayment = !onProposalHistoryPage && Boolean(waitingForPaymentToBeProcessed?.length)
  const isAbleToMakeProposalRoundVote = satelliteAbleToMakeProposalRoundVote
  const canDropPhase = [
    ProposalStatus.ACTIVE,
    ProposalStatus.LOCKED,
    ProposalStatus.ONGOING,
    ProposalStatus.UNLOCKED,
  ].includes(statusFlag)

  const someVisible = Object.values(visibleLists).some((item) => item)

  useEffect(() => {
    const visibleTypes: Record<string, boolean> = {
      wating: isVisibleWating,
      ongoingVoiting: isVisibleOngoingVoting,
      ongoingTimeLock: isVisibleOngoingTimeLock,
      next: isVisibleNextProposal,
      history: isVisibleHistoryProposal,
    }
    setVisibleLists(visibleTypes)

    const defaultProposalSelectedListName = Object.keys(visibleTypes).find((key: string) =>
      Boolean(visibleTypes[key]),
    ) as 'wating' | 'ongoingVoiting' | 'ongoingTimeLock' | 'next' | 'history' | undefined

    switch (defaultProposalSelectedListName) {
      case 'wating':
        setRightSideContent(watingProposals[0])
        break
      case 'ongoingVoiting':
        setRightSideContent(ongoingProposals[0])
        break
      case 'ongoingTimeLock':
        setRightSideContent(ongoingProposals[0])
        break
      case 'next':
        setRightSideContent(nextProposals[0])
        break
      case 'history':
        setRightSideContent(pastProposals[0])
        break
    }
  }, [
    isVisibleWating,
    isVisibleOngoingVoting,
    isVisibleOngoingTimeLock,
    isVisibleNextProposal,
    isVisibleHistoryProposal,
    watingProposals,
    ongoingProposals,
    nextProposals,
    pastProposals,
  ])

  const handleGetTimestampByLevel = async (level: number) => {
    const res = await getTimestampByLevel(level)
    setVotingEnding(res)
  }
  const handleClickExecuteProposal = () => {
    if (rightSideContent?.id) {
      handleExecuteProposal(rightSideContent.id)
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

  const votingTime = new Date(votingEnding).getTime()
  const isEndedVotingTime = votingTime < Date.now()

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    dispatch(showToaster('SUCCESS', 'Copied to Clipboard', `${getShortByte(text, 16, 16)}`))
  }

  const handleDeleteProposal = async () => {
    if (rightSideContent?.proposerId === accountPkh && rightSideContent)
      await dispatch(dropProposal(rightSideContent?.id))
  }

  return (
    <GovernanceStyled>
      {someVisible ? (
        <GovernanceLeftContainer>
          {isVisibleWating && (
            <Proposals
              proposalsList={watingProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              title="Waiting for Execution"
              type="wating"
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
              listName={WAITING_FOR_PAYMENT_PROPOSALS_LIST_NAME}
            />
          )}
          {isVisibleOngoingVoting && (
            <Proposals
              proposalsList={ongoingProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              type="ongoingVoiting"
              listName={ONGOING_VOTING_PROPOSALS_LIST_NAME}
            />
          )}
          {isVisibleOngoingTimeLock && (
            <Proposals
              proposalsList={ongoingProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              type="ongoingTimeLock"
              listName={ONGOING_PROPOSALS_LIST_NAME}
            />
          )}
          {isVisibleNextProposal && (
            <Proposals
              proposalsList={nextProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              type="next"
              listName={NEXT_PROPOSALS_LIST_NAME}
            />
          )}
          {isVisibleHistoryProposal && (
            <Proposals
              proposalsList={pastProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              type="history"
              listName={HISTORY_PROPOSALS_LIST_NAME}
            />
          )}
        </GovernanceLeftContainer>
      ) : (
        emptyContainer
      )}
      {rightSideContent && rightSideContent.id !== 0 ? (
        <GovernanceRightContainer isAuthorized={Boolean(accountPkh)}>
          <GovRightContainerTitleArea>
            <h1>{rightSideContent.title}</h1>
            <StatusFlag text={statusFlag} status={statusFlag} />
          </GovRightContainerTitleArea>

          {votingEnding ? (
            <RightSideSubContent id="votingDeadline">
              Voting {isEndedVotingTime ? 'ended' : 'ending'} on{' '}
              {parseDate({ time: votingTime, timeFormat: 'MMMM Do HH:mm Z' })} CEST
            </RightSideSubContent>
          ) : null}

          {statusFlag === 'UNLOCKED' ? (
            <InfoBlock className="info-block">
              <Icon id="info" />
              {userIsSatellite ? (
                <p>
                  Your proposal isn’t locked yet and can’t be voted on. You can lock it on the proposal submission page.
                </p>
              ) : (
                <p>
                  This proposal isn’t locked yet and can’t be voted on until then. The proposer is still building it and
                  will lock it in the coming days
                </p>
              )}
            </InfoBlock>
          ) : null}

          <div className="voting-proposal">
            <VotingProposalsArea
              voteStatistics={voteStatistics}
              currentProposalStage={{
                isPastProposals: isVisibleHistoryProposal,
                isTimeLock: isVisibleOngoingTimeLock,
                isAbleToMakeProposalRoundVote,
                isVotingPeriod: isVisibleOngoingVoting,
              }}
              votingPhaseHandler={handleVotingRoundVote}
              handleProposalVote={handleProposalRoundVote}
              selectedProposal={rightSideContent}
              vote={rightSideContent.votes.find(
                ({ voter_id, round }) =>
                  voter_id === accountPkh && round === (governancePhase === GovPhases.PROPOSAL ? 0 : 1),
              )}
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

          {rightSideContent.description ? (
            <article>
              <RightSideSubHeader>Description</RightSideSubHeader>
              <RightSideSubContent>{rightSideContent.description}</RightSideSubContent>
            </article>
          ) : null}

          <article>
            <RightSideSubHeader>Source Code</RightSideSubHeader>
            <RightSideSubContent>
              {rightSideContent.sourceCode ? (
                <a href={rightSideContent.sourceCode} target="_blank" rel="noreferrer">
                  {rightSideContent.sourceCode}
                </a>
              ) : (
                'No link to source code given'
              )}
            </RightSideSubContent>
          </article>

          <article>
            <RightSideSubHeader>Meta-Data</RightSideSubHeader>
            {rightSideContent.proposalData?.length ? (
              <ol className="proposal-list">
                {rightSideContent.proposalData.map((item) => {
                  if (!item || !item.encoded_code) return null
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
                            {visibleMeta === unique ? (
                              <span className="byte">
                                <button onClick={() => handleCopyToClipboard(item.encoded_code ?? '')}>
                                  {item.encoded_code} <Icon id="copyToClipboard" />
                                </button>
                                <br />
                                <button onClick={() => setVisibleMeta('')} className="visible-button">
                                  hide
                                </button>
                              </span>
                            ) : (
                              <span className="short-byte">
                                {getShortByte(item.encoded_code)}{' '}
                                <button onClick={() => setVisibleMeta(unique)} className="visible-button">
                                  see all
                                </button>
                              </span>
                            )}
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
                    {rightSideContent.proposalPayments.map((item: Governance_Proposal_Payment, i: number) => {
                      if (!item || !item.token_amount) return null
                      const paymentType = dipDupTokens.find(({ contract }) => contract === item.token_address)?.metadata
                        .symbol

                      const amount =
                        paymentType === 'MVK'
                          ? calcWithoutPrecision(item.token_amount)
                          : calcWithoutMu(item.token_amount)

                      return (
                        <tr key={item.id}>
                          <td>
                            <TzAddress tzAddress={item.to__id || ''} hasIcon={false} isBold={true} />
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
                <div className="address">
                  <TzAddress tzAddress={rightSideContent.proposerId} hasIcon={true} isBold={true} />
                </div>
              </RightSideSubContent>
            </article>
          ) : null}

          {rightSideContent.governanceId ? (
            <article>
              <RightSideSubHeader>Governance Info</RightSideSubHeader>
              <div className="governance-contract">
                <p>Governance Contract</p>
                <TzAddress tzAddress={rightSideContent.governanceId} hasIcon={false} isBold={true} />
              </div>
            </article>
          ) : null}
          {userIsSatellite &&
          !isVisibleHistoryProposal &&
          canDropPhase &&
          rightSideContent.proposerId === accountPkh ? (
            <div className="drop-proposal">
              <Button icon="close-stroke" text="Drop Proposal" kind="actionSecondary" onClick={handleDeleteProposal} />
            </div>
          ) : null}
        </GovernanceRightContainer>
      ) : null}
    </GovernanceStyled>
  )
}
