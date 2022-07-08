import { Tooltip } from '@mui/material'
import * as PropTypes from 'prop-types'
import * as React from 'react'

import { CommaNumber } from '../../../../app/App.components/CommaNumber/CommaNumber.controller'
import { VoteStatistics } from '../../Governance.controller'
import { VotingBarStatus } from './VotingBar.constants'

import {
  NotYetVoted,
  QuorumBar,
  VotingAbstention,
  VotingAgainst,
  VotingBarStyled,
  VotingContainer,
  VotingFor,
} from './VotingBar.style'

type VotingViewProps = {
  yayVotesSmvkTotal: number
  nayVotesSmvkTotal: number
  passVoteSmvkTotal: number
  snapshotSmvkTotalSupply: number
  smvkPercentageForApproval: number
}

export const VotingBarBlockView = ({
  passVoteSmvkTotal = 0,
  yayVotesSmvkTotal = 0,
  nayVotesSmvkTotal = 0,
  snapshotSmvkTotalSupply = 0,
  smvkPercentageForApproval = 0,
}: VotingViewProps) => {
  const yayVotesSmvkTotalWidth = (yayVotesSmvkTotal / snapshotSmvkTotalSupply) * 100
  const passVoteSmvkTotalWidth = (passVoteSmvkTotal / snapshotSmvkTotalSupply) * 100
  const nayVotesSmvkTotalWidth = (nayVotesSmvkTotal / snapshotSmvkTotalSupply) * 100
  const unusedVotes = snapshotSmvkTotalSupply - (yayVotesSmvkTotal + passVoteSmvkTotal + nayVotesSmvkTotal)
  const unusedVotesWidth = (unusedVotes / snapshotSmvkTotalSupply) * 100

  const quorumWidth = smvkPercentageForApproval / 100

  return (
    <VotingContainer>
      <QuorumBar width={quorumWidth}>
        Quorum <b>{quorumWidth.toFixed(2)}%</b>
      </QuorumBar>
      <VotingBarStyled>
        <Tooltip title={`${yayVotesSmvkTotal} Yay votes`}>
          <VotingFor width={yayVotesSmvkTotalWidth}>
            <CommaNumber value={yayVotesSmvkTotal} />
          </VotingFor>
        </Tooltip>
        <Tooltip title={`${passVoteSmvkTotal} Abstention votes`}>
          <VotingAbstention width={passVoteSmvkTotalWidth}>
            <CommaNumber value={passVoteSmvkTotal} />
          </VotingAbstention>
        </Tooltip>
        <Tooltip title={`${unusedVotes} Unused votes`}>
          <NotYetVoted width={unusedVotesWidth}>
            <CommaNumber value={unusedVotes} />
          </NotYetVoted>
        </Tooltip>

        <Tooltip title={`${nayVotesSmvkTotal} Nay votes`}>
          <VotingAgainst width={nayVotesSmvkTotalWidth}>
            <CommaNumber value={nayVotesSmvkTotal} />
          </VotingAgainst>
        </Tooltip>
      </VotingBarStyled>
    </VotingContainer>
  )
}
