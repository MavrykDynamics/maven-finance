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

type VotingType = VotingProps & {
  className?: string
}

export const VotingArea = ({
  showVotingButtons = true,
  disableVotingButtons = false,
  handleVote,
  isVotingActive,
  quorumText,
  voteStatistics,
  className,
}: VotingType) => {
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { isSatellite } = useSelector((state: State) => state.user)

  const votingButtons = accountPkh ? (
    isSatellite && handleVote ? (
      <VotingButtonsContainer>
        <Button
          text={'Vote YES'}
          onClick={() => handleVote('yay')}
          type={SUBMIT}
          kind={'votingFor'}
          disabled={disableVotingButtons}
        />
        <Button
          text={'Vote PASS'}
          onClick={() => handleVote('nay')}
          type={SUBMIT}
          kind={'votingAbstain'}
          disabled={disableVotingButtons}
        />
        <Button
          text={'Vote NO'}
          onClick={() => handleVote('pass')}
          type={SUBMIT}
          kind={'votingAgainst'}
          disabled={disableVotingButtons}
        />
      </VotingButtonsContainer>
    ) : null
  ) : (
    <ConnectWallet />
  )

  return (
    <VotingAreaStyled className={className}>
      <VotingBar voteStatistics={voteStatistics} quorumText={quorumText} />
      {isVotingActive && showVotingButtons ? votingButtons : null}
    </VotingAreaStyled>
  )
}

type VotingProposalsType = VotingProposalsProps & {
  className?: string
}

export const VotingProposalsArea = ({
  selectedProposal,
  vote,
  handleProposalVote,
  voteStatistics,
  currentProposalStage: { isPastProposals, isTimeLock, isAbleToMakeProposalRoundVote, isVotingPeriod },
  votingPhaseHandler,
  className,
}: VotingProposalsType) => {
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { isSatellite } = useSelector((state: State) => state.user)

  if (isPastProposals || isTimeLock) {
    return <VotingBar voteStatistics={voteStatistics} />
  }

  if (isVotingPeriod && votingPhaseHandler) {
    return (
      <VotingArea
        voteStatistics={voteStatistics}
        isVotingActive={true}
        handleVote={votingPhaseHandler}
        disableVotingButtons={vote?.round === 1}
      />
    )
  }

  if (isAbleToMakeProposalRoundVote) {
    return (
      <VotingAreaStyled className={className}>
        <div className="voted-block">
          <CommaNumber className="voted-label" value={voteStatistics.forVotesMVKTotal} endingText={'voted MVK'} />
          {accountPkh ? (
            <Button
              text={'Vote for this Proposal'}
              onClick={() => handleProposalVote(Number(selectedProposal.id))}
              type={SUBMIT}
              kind="actionPrimary"
              disabled={vote?.round === 0 || !isSatellite}
            />
          ) : (
            <ConnectWallet />
          )}
        </div>
      </VotingAreaStyled>
    )
  }

  return null
}
