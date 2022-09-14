import { useMemo, useState } from 'react'
import { Tooltip } from '@mui/material'
import { useDispatch } from 'react-redux'

import { connect } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { votingRoundVote } from 'pages/Governance/Governance.actions'
import { SUBMIT } from 'app/App.components/Button/Button.constants'

import { GovernanceFinancialRequestGraphQL } from '../../../utils/TypesAndInterfaces/Governance'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { NoWalletConnectedButton } from 'app/App.components/ConnectWallet/ConnectWallet.view'

import { VotingAreaStyled, VotingButtonsContainer } from 'pages/Governance/VotingArea/VotingArea.style'
import {
  VotingContainer,
  QuorumBar,
  VotingBarStyled,
  VotingFor,
  VotingAbstention,
  VotingAgainst,
} from 'pages/Governance/VotingArea/VotingBar/VotingBar.style'
import { PRECISION_NUMBER } from 'utils/constants'

type FRVotingProps = {
  isActiveVoting: boolean
  walletConnected: boolean
  loading: boolean
  selectedRequest: GovernanceFinancialRequestGraphQL
}

const FRVoting = ({ walletConnected, isActiveVoting, loading, selectedRequest }: FRVotingProps) => {
  const dispatch = useDispatch()

  const handleConnect = () => dispatch(connect({ forcePermission: false }))

  const [votingStats, setVoteStatistics] = useState({
    totalVotes: selectedRequest.pass_vote_smvk_total + selectedRequest.nay_vote_smvk_total,
    forVotes: selectedRequest.yay_vote_smvk_total,
    againstVotes: selectedRequest.nay_vote_smvk_total,
    abstainVotesMVKTotal: selectedRequest.pass_vote_smvk_total,
    unUsedVotes: Math.round(
      selectedRequest.snapshot_smvk_total_supply / PRECISION_NUMBER -
        selectedRequest.yay_vote_smvk_total -
        selectedRequest.pass_vote_smvk_total -
        selectedRequest.nay_vote_smvk_total,
    ),
    quorum: selectedRequest.smvk_percentage_for_approval / 100,
  })

  const handleVotingRoundVote = (vote: string) => {
    let voteType
    switch (vote) {
      case 'FOR':
        voteType = 'yay'
        setVoteStatistics({
          ...votingStats,
          forVotes: +votingStats.forVotes + 1,
          unUsedVotes: +votingStats.unUsedVotes - 1,
        })
        break
      case 'AGAINST':
        voteType = 'nay'
        setVoteStatistics({
          ...votingStats,
          againstVotes: votingStats.againstVotes + 1,
          unUsedVotes: +votingStats.unUsedVotes - 1,
        })
        break
      case 'ABSTAIN':
      default:
        voteType = 'abstain'
        setVoteStatistics({
          ...votingStats,
          abstainVotesMVKTotal: votingStats.abstainVotesMVKTotal + 1,
          unUsedVotes: +votingStats.unUsedVotes - 1,
        })
        break
    }

    dispatch(votingRoundVote(voteType))
  }

  const totalVotesWithUnused = useMemo(
    () => votingStats.forVotes + votingStats.againstVotes + votingStats.unUsedVotes + votingStats.abstainVotesMVKTotal,
    [votingStats.againstVotes, votingStats.forVotes, votingStats.unUsedVotes, votingStats.abstainVotesMVKTotal],
  )
  const forVotesWidth = (votingStats.forVotes / totalVotesWithUnused) * 100
  const againstVotesWidth = (votingStats.againstVotes / totalVotesWithUnused) * 100
  const abstainVotesWidth = (votingStats.abstainVotesMVKTotal / totalVotesWithUnused) * 100

  return (
    <>
      <VotingContainer showButtons={!walletConnected && isActiveVoting}>
        <QuorumBar width={votingStats.quorum}>
          Quorum <b>{votingStats.quorum.toFixed(2)}%</b>
        </QuorumBar>
        <VotingBarStyled>
          <Tooltip title={`${votingStats.forVotes} Yay votes`}>
            <VotingFor width={forVotesWidth}>
              <CommaNumber value={votingStats.forVotes} />
            </VotingFor>
          </Tooltip>
          <Tooltip title={`${votingStats.abstainVotesMVKTotal} Abstention votes`}>
            <VotingAbstention width={abstainVotesWidth}>
              <CommaNumber value={votingStats.abstainVotesMVKTotal} />
            </VotingAbstention>
          </Tooltip>
          <Tooltip title={`${votingStats.unUsedVotes} Unused votes`}>
            <VotingAbstention width={100 - forVotesWidth - againstVotesWidth}>
              <CommaNumber value={votingStats.unUsedVotes} />
            </VotingAbstention>
          </Tooltip>

          <Tooltip title={`${votingStats.againstVotes} Nay votes`}>
            <VotingAgainst width={againstVotesWidth}>
              <CommaNumber value={votingStats.againstVotes} />
            </VotingAgainst>
          </Tooltip>
        </VotingBarStyled>
      </VotingContainer>

      {isActiveVoting ? (
        <VotingAreaStyled className="FRVoting">
          {walletConnected ? (
            <VotingButtonsContainer className="FRVoting">
              <Button
                text={'Vote YES'}
                onClick={() => handleVotingRoundVote('FOR')}
                type={SUBMIT}
                kind={'votingFor'}
                loading={loading}
              />
              <Button
                text={'Vote PASS'}
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
          ) : (
            <div className="voted-block">
              <CommaNumber className="voted-label" value={votingStats.totalVotes} endingText={'voted MVK'} />
              <NoWalletConnectedButton handleConnect={handleConnect} />
            </div>
          )}
        </VotingAreaStyled>
      ) : null}
    </>
  )
}

export default FRVoting
