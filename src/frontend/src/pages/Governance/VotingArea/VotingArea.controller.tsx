import { Button } from '../../../app/App.components/Button/Button.controller'
import { SUBMIT } from '../../../app/App.components/Button/Button.constants'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import * as React from 'react'
import { VotingAreaStyled, VotingButtonsContainer } from './VotingArea.style'
import { connect } from '../../../app/App.components/ConnectWallet/ConnectWallet.actions'
import { useDispatch, useSelector } from 'react-redux'
import { NoWalletConnectedButton } from '../../../app/App.components/ConnectWallet/ConnectWallet.view'
import { ConnectWalletStyled } from 'app/App.components/ConnectWallet/ConnectWallet.style'
import { VotingBar } from './VotingBar/VotingBar.controller'
import { State } from '../../../reducers'
import { ProposalRecordType } from '../../../utils/TypesAndInterfaces/Governance'
import { VoteStatistics } from '../Governance.controller'
import { SatelliteRecord } from '../../../utils/TypesAndInterfaces/Delegation'
import { calcWithoutPrecision } from '../../../utils/calcFunctions'

type VotingAreaProps = {
  ready: boolean
  loading: boolean
  isVisibleHistoryProposal?: boolean
  accountPkh: string | undefined
  handleProposalRoundVote: (proposalId: number) => void
  handleVotingRoundVote: (vote: string) => void
  selectedProposal: {
    passVoteMvkTotal: number
    id: number | string
  }
  voteStatistics: VoteStatistics
}
export const VotingArea = ({
  ready,
  loading,
  isVisibleHistoryProposal = false,
  accountPkh,
  handleProposalRoundVote,
  handleVotingRoundVote,
  selectedProposal,
  voteStatistics,
}: VotingAreaProps) => {
  const dispatch = useDispatch()
  const { governanceStorage, governancePhase } = useSelector((state: State) => state.governance)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { mvkTokenStorage } = useSelector((state: State) => state.mvkToken)
  const satelliteLedger = delegationStorage?.satelliteLedger
  const accountPkhIsSatellite =
    satelliteLedger?.filter((satellite: SatelliteRecord) => satellite.address === accountPkh)[0] !== undefined

  const handleConnect = () => {
    dispatch(connect({ forcePermission: false }))
  }

  // const totalMVKVotedCalculated =
  //   voteStatistics.forVotesMVKTotal + voteStatistics.abstainVotesMVKTotal + voteStatistics.againstVotesMVKTotal

  const totalMVKVoted = isNaN(selectedProposal.passVoteMvkTotal) ? 0 : selectedProposal.passVoteMvkTotal

  const dividedPassVoteMvkTotal = totalMVKVoted / 1_000_000_000

  return (
    <>
      {ready && governancePhase === 'VOTING' && accountPkhIsSatellite ? (
        <VotingBar
          totalMVKVoted={dividedPassVoteMvkTotal}
          totalCirculatingMVKSupply={mvkTokenStorage.totalSupply}
          voteStatistics={voteStatistics}
          loading={loading}
        />
      ) : null}
      <VotingAreaStyled>
        {!ready && governancePhase !== 'TIME_LOCK' && (
          <div className="voted-block">
            <CommaNumber className="voted-label" value={dividedPassVoteMvkTotal} endingText={'voted MVK'} />
            <NoWalletConnectedButton handleConnect={handleConnect} />
          </div>
        )}

        {ready && governancePhase === 'VOTING' && accountPkhIsSatellite && !isVisibleHistoryProposal && (
          <VotingButtonsContainer>
            <Button text={'Vote YES'} onClick={() => handleVotingRoundVote('FOR')} type={SUBMIT} kind={'votingFor'} />
            <Button
              text={'Vote PASS'}
              onClick={() => handleVotingRoundVote('ABSTAIN')}
              type={SUBMIT}
              kind={'votingAbstain'}
            />
            <Button
              text={'Vote NO'}
              onClick={() => handleVotingRoundVote('AGAINST')}
              type={SUBMIT}
              kind={'votingAgainst'}
            />
          </VotingButtonsContainer>
        )}

        {ready && governancePhase === 'PROPOSAL' && accountPkhIsSatellite && !isVisibleHistoryProposal && (
          <div className="voted-block">
            <CommaNumber className="voted-label" value={dividedPassVoteMvkTotal} endingText={'voted MVK'} />
            <Button
              text={'Vote for this Proposal'}
              onClick={() => handleProposalRoundVote(Number(selectedProposal.id))}
              type={SUBMIT}
              kind="actionPrimary"
              loading={loading}
            />
          </div>
        )}

        {ready && (!accountPkhIsSatellite || governancePhase === 'TIME_LOCK') && totalMVKVoted ? (
          <div className="voted-block">
            <CommaNumber className="voted-label" value={dividedPassVoteMvkTotal} endingText={'voted MVK'} />
          </div>
        ) : null}
      </VotingAreaStyled>
    </>
  )
}
