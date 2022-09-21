import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'

// types, constants, helpers
import { State } from 'reducers'
import { SUBMIT } from '../Button/Button.constants'
import { VotingProposalsProps, VotingProps } from './helpers/voting'

// styles
import { VotingAreaStyled, VotingButtonsContainer } from './VotingArea.style'

// view
import { VotingBar } from './VotingBar.controller'
import { Button } from '../Button/Button.controller'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { ConnectWallet } from '../ConnectWallet/ConnectWallet.controller'

export const VotingArea = ({
  showVotingButtons = true,
  handleVote,
  isVotingActive,
  quorumText,
  voteStatistics,
}: VotingProps) => {
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)

  const isUserSatellite = useMemo(
    () => Boolean(satelliteLedger.find(({ address }) => address === accountPkh)),
    [accountPkh, satelliteLedger],
  )

  const votingButtons = accountPkh ? (
    isUserSatellite && handleVote ? (
      <VotingButtonsContainer>
        <Button text={'Vote YES'} onClick={() => handleVote('FOR')} type={SUBMIT} kind={'votingFor'} />
        <Button text={'Vote PASS'} onClick={() => handleVote('ABSTAIN')} type={SUBMIT} kind={'votingAbstain'} />
        <Button text={'Vote NO'} onClick={() => handleVote('AGAINST')} type={SUBMIT} kind={'votingAgainst'} />
      </VotingButtonsContainer>
    ) : null
  ) : (
    <ConnectWallet />
  )

  return (
    <VotingAreaStyled>
      <VotingBar voteStatistics={voteStatistics} quorumText={quorumText} />
      {isVotingActive && showVotingButtons ? votingButtons : null}
    </VotingAreaStyled>
  )
}

export const VotingProposalsArea = ({
  selectedProposal,
  handleProposalVote,
  voteStatistics,
  currentProposalStage: { isPastProposals, isTimeLock, isAbleToMakeProposalRoundVote },
}: VotingProposalsProps) => {
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const isUserSatellite = useMemo(
    () => Boolean(satelliteLedger.find(({ address }) => address === accountPkh)),
    [accountPkh, satelliteLedger],
  )

  if (isPastProposals) {
    return <VotingBar voteStatistics={voteStatistics} />
  }

  if (isTimeLock && !accountPkh) {
    return (
      <VotingAreaStyled>
        <div className="voted-block">
          <CommaNumber className="voted-label" value={voteStatistics.forVotesMVKTotal} endingText={'voted MVK'} />
          <ConnectWallet />
        </div>
      </VotingAreaStyled>
    )
  }

  if (isTimeLock && !isUserSatellite && accountPkh) {
    return (
      <VotingAreaStyled>
        <div className="voted-block">
          <CommaNumber className="voted-label" value={voteStatistics.forVotesMVKTotal} endingText={'voted MVK'} />
        </div>
      </VotingAreaStyled>
    )
  }

  if (isAbleToMakeProposalRoundVote) {
    return (
      <VotingAreaStyled>
        <div className="voted-block">
          <CommaNumber className="voted-label" value={voteStatistics.forVotesMVKTotal} endingText={'voted MVK'} />
          <Button
            text={'Vote for this Proposal'}
            onClick={() => handleProposalVote(Number(selectedProposal.id))}
            type={SUBMIT}
            kind="actionPrimary"
          />
        </div>
      </VotingAreaStyled>
    )
  }

  return null
}
