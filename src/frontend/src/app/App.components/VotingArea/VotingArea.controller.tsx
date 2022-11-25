import { useSelector } from 'react-redux'

// types, constants, helpers
import { State } from 'reducers'
import { VotingProposalsProps, VotingProps } from './helpers/voting'
import { VotingTypes } from './helpers/voting.const'

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
  buttonsToShow,
}: VotingType) => {
  const { forBtn, againsBtn, passBtn } = buttonsToShow ?? { forBtn: {}, againsBtn: {}, passBtn: {} }
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { isSatellite } = useSelector((state: State) => state.user)

  const votingButtons = accountPkh ? (
    isSatellite && handleVote ? (
      <VotingButtonsContainer>
        {forBtn && (
          <Button
            text={forBtn.text ?? 'Vote YES'}
            onClick={() => handleVote(VotingTypes.YES)}
            kind={'votingFor'}
            disabled={disableVotingButtons}
          />
        )}
        {passBtn && (
          <Button
            text={passBtn.text ?? 'Vote PASS'}
            onClick={() => handleVote(VotingTypes.NO)}
            kind={'votingAbstain'}
            disabled={disableVotingButtons}
          />
        )}
        {againsBtn && (
          <Button
            text={againsBtn.text ?? 'Vote NO'}
            onClick={() => handleVote(VotingTypes.PASS)}
            kind={'votingAgainst'}
            disabled={disableVotingButtons}
          />
        )}
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
