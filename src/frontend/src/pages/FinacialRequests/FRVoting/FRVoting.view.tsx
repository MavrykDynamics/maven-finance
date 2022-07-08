import React, { useMemo, useState } from 'react'
import { Tooltip } from '@mui/material'
import { useDispatch } from 'react-redux'

import { connect } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { votingRoundVote } from 'pages/Governance/Governance.actions'
import { SUBMIT } from 'app/App.components/Button/Button.constants'

import { FinancialRequestBody } from '../FinancialRequests.types'

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
  ready: boolean
  loading: boolean
  selectedRequest: FinancialRequestBody
}

const FRVoting = ({ ready, loading, selectedRequest }: FRVotingProps) => {
  const dispatch = useDispatch()

  const handleConnect = () => {
    dispatch(connect({ forcePermission: false }))
  }

  // TODO: remove logs, after fix voting output
  console.log('%c Financial requests voting debug: selected request: ', 'color: #7716ff; font-size: 18px;')
  console.table(selectedRequest)

  const [votingStats, setVoteStatistics] = useState({
    totalVotes: selectedRequest.pass_vote_smvk_total + selectedRequest.nay_vote_smvk_total,
    forVotes: selectedRequest.pass_vote_smvk_total,
    againstVotes: selectedRequest.nay_vote_smvk_total,
    unUsedVotes: Math.round(
      selectedRequest.snapshot_smvk_total_supply / PRECISION_NUMBER -
        selectedRequest.pass_vote_smvk_total -
        selectedRequest.nay_vote_smvk_total,
    ),
    quorum: selectedRequest.smvk_percentage_for_approval / 100,
  })

  const handleVotingRoundVote = (vote: string) => {
    let voteType
    switch (vote) {
      case 'FOR':
        voteType = 1
        setVoteStatistics({
          ...votingStats,
          forVotes: +votingStats.forVotes + 1,
          unUsedVotes: +votingStats.unUsedVotes - 1,
        })
        break
      case 'AGAINST':
      default:
        voteType = 0
        setVoteStatistics({
          ...votingStats,
          againstVotes: +votingStats.againstVotes + 1,
          unUsedVotes: +votingStats.unUsedVotes - 1,
        })
        break
    }

    dispatch(votingRoundVote(voteType))
  }

  const totalVotesWithUnused = useMemo(
    () => votingStats.forVotes + votingStats.againstVotes + votingStats.unUsedVotes,
    [],
  )
  const forVotesWidth = (votingStats.forVotes / totalVotesWithUnused) * 100
  const againstVotesWidth = (votingStats.againstVotes / totalVotesWithUnused) * 100

  return ready ? (
    <>
      <VotingContainer>
        <QuorumBar width={votingStats.quorum}>
          Quorum <b>{votingStats.quorum.toFixed(2)}%</b>
        </QuorumBar>
        <VotingBarStyled>
          <Tooltip title={`${votingStats.forVotes} Approve votes`}>
            <VotingFor width={forVotesWidth}>
              <CommaNumber value={votingStats.forVotes} />
            </VotingFor>
          </Tooltip>
          <Tooltip title={`${votingStats.unUsedVotes} Unused votes`}>
            <VotingAbstention width={100 - forVotesWidth - againstVotesWidth}>
              <CommaNumber value={votingStats.unUsedVotes} />
            </VotingAbstention>
          </Tooltip>

          <Tooltip title={`${votingStats.againstVotes} Disapprove votes`}>
            <VotingAgainst width={againstVotesWidth}>
              <CommaNumber value={votingStats.againstVotes} />
            </VotingAgainst>
          </Tooltip>
        </VotingBarStyled>
      </VotingContainer>

      <VotingAreaStyled>
        <VotingButtonsContainer className="FRVoting">
          <Button
            text={'Approve'}
            onClick={() => handleVotingRoundVote('FOR')}
            type={SUBMIT}
            kind={'votingFor'}
            loading={loading}
          />
          <Button
            text={'Disapprove'}
            onClick={() => handleVotingRoundVote('AGAINST')}
            type={SUBMIT}
            kind={'votingAgainst'}
            loading={loading}
          />
        </VotingButtonsContainer>
      </VotingAreaStyled>
    </>
  ) : (
    <VotingAreaStyled>
      <div className="voted-block">
        <CommaNumber className="voted-label" value={votingStats.totalVotes} endingText={'voted MVK'} />
        <NoWalletConnectedButton handleConnect={handleConnect} />
      </div>
    </VotingAreaStyled>
  )
}

export default FRVoting
