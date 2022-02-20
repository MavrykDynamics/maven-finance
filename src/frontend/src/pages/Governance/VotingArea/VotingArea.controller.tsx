import { RightSideVotingArea } from '../Governance.style'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { SUBMIT, TRANSPARENT } from '../../../app/App.components/Button/Button.constants'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import * as React from 'react'
import { ProposalData } from '../mockProposals'
import { VotingAreaStyled, VotingButtonsContainer } from './VotingArea.style'
import { connect } from '../../../app/App.components/Menu/Menu.actions'
import { useDispatch, useSelector } from 'react-redux'
import { NoWalletConnectedButton } from '../../../app/App.components/ConnectWallet/ConnectWallet.view'
import { ConnectWalletStyled } from 'app/App.components/ConnectWallet/ConnectWallet.style'
import { VotingBar } from './VotingBar/VotingBar.controller'
import { SatelliteRecord } from '../../../reducers/delegation'
import { State } from '../../../reducers'

type VotingAreaProps = {
  ready: boolean
  loading: boolean
  accountPkh: string | undefined
  handleVoteForProposal: (vote: string) => void
  selectedProposal: ProposalData
  voteStatistics: any
}
export const VotingArea = ({
  ready,
  loading,
  accountPkh,
  handleVoteForProposal,
  selectedProposal,
  voteStatistics,
}: VotingAreaProps) => {
  const dispatch = useDispatch()
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { satelliteLedger } = delegationStorage
  const accountPkhIsSatellite =
    satelliteLedger?.filter((satellite: SatelliteRecord) => satellite.address === accountPkh)[0] !== undefined
  console.log(accountPkhIsSatellite)
  const handleConnect = () => {
    dispatch(connect({ forcePermission: false }))
  }

  return (
    <>
      <VotingBar
        abstainingVotes={voteStatistics.abstainingVotes}
        againstVotes={voteStatistics.againstVotes}
        forVotes={voteStatistics.forVotes}
        unusedVotes={voteStatistics.unusedVotes}
        loading
      />
      <VotingAreaStyled>
        {!ready && (
          <>
            <ConnectWalletStyled>
              <NoWalletConnectedButton handleConnect={handleConnect} />
            </ConnectWalletStyled>
            <CommaNumber value={selectedProposal.votedMVK} endingText={'voted MVK'} />
          </>
        )}
        {ready && accountPkhIsSatellite && (
          <VotingButtonsContainer>
            <Button text={'Vote Yay'} onClick={() => handleVoteForProposal('FOR')} type={SUBMIT} kind={'votingFor'} />
            <Button
              text={'Vote Abstain'}
              onClick={() => handleVoteForProposal('ABSTAIN')}
              type={SUBMIT}
              kind={'votingAbstain'}
            />
            <Button
              text={'Vote NO'}
              onClick={() => handleVoteForProposal('AGAINST')}
              type={SUBMIT}
              kind={'votingAgainst'}
            />
          </VotingButtonsContainer>
        )}
        {ready && !accountPkhIsSatellite && (
          <VotingButtonsContainer>
            <CommaNumber value={selectedProposal.votedMVK} endingText={'voted MVK'} />
          </VotingButtonsContainer>
        )}
      </VotingAreaStyled>
    </>
  )
}
