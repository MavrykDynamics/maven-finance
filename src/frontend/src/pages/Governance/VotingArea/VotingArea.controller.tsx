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

type VotingAreaProps = {
  ready: boolean
  loading: boolean
  accountPkh: string | undefined
  handleProposalRoundVote: (proposalId: number) => void
  handleVotingRoundVote: (vote: string) => void
  selectedProposal: ProposalRecordType
  voteStatistics: VoteStatistics
}
export const VotingArea = ({
  ready,
  loading,
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
  const totalMVKVoted =
    voteStatistics.forVotesMVKTotal + voteStatistics.abstainVotesMVKTotal + voteStatistics.againstVotesMVKTotal

  return (
    <>
      {ready && governancePhase === 'VOTING' && accountPkhIsSatellite ? (
        <VotingBar
          totalMVKVoted={totalMVKVoted}
          totalCirculatingMVKSupply={mvkTokenStorage.totalSupply}
          voteStatistics={voteStatistics}
          loading={loading}
        />
      ) : null}
      <VotingAreaStyled>
        {/* {true && ( */}
        {!ready && ready && governancePhase !== 'TIME_LOCK' && (
          <div className="voted-block">
            <CommaNumber className="voted-label" value={totalMVKVoted} endingText={'voted MVK'} />
            <NoWalletConnectedButton handleConnect={handleConnect} />
          </div>
        )}

        {/* {true && ( */}
        {ready && governancePhase === 'VOTING' && accountPkhIsSatellite && (
          <VotingButtonsContainer>
            <Button
              text={'Vote Yay'}
              onClick={() => handleVotingRoundVote('FOR')}
              type={SUBMIT}
              kind={'votingFor'}
              loading={loading}
            />
            <Button
              text={'Vote Abstain'}
              onClick={() => handleVotingRoundVote('ABSTAIN')}
              type={SUBMIT}
              kind={'votingAbstain'}
              loading={loading}
            />
            <Button
              text={'Vote NO'}
              onClick={() => handleVotingRoundVote('AGAINST')}
              type={SUBMIT}
              kind={'votingAgainst'}
              loading={loading}
            />
          </VotingButtonsContainer>
        )}
        {/* {true && ( */}
        {ready && governancePhase === 'PROPOSAL' && accountPkhIsSatellite && (
          <div className="voted-block">
            <CommaNumber className="voted-label" value={totalMVKVoted} endingText={'voted MVK'} />
            <Button
              text={'Vote for this Proposal'}
              onClick={() => handleProposalRoundVote(Number(selectedProposal.id))}
              type={SUBMIT}
              kind="actionPrimary"
              loading={loading}
            />
          </div>
        )}
        {/* {true && ( */}
        {ready && (!accountPkhIsSatellite || governancePhase === 'TIME_LOCK') && (
          <div className="voted-block">
            <CommaNumber className="voted-label" value={totalMVKVoted} endingText={'voted MVK'} />
          </div>
        )}
      </VotingAreaStyled>
    </>
  )
}
