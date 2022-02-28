import * as PropTypes from 'prop-types'
import * as React from 'react'
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
import { Tooltip } from '@mui/material'
import { VoteStatistics } from '../../Governance.controller'

type VotingViewProps = {
  status: VotingBarStatus
  loading: boolean
  totalMVKVoted: number
  voteStatistics: VoteStatistics
}

export const VotingBarView = ({ status, totalMVKVoted, voteStatistics }: VotingViewProps) => {
  const forVotesWidth = (voteStatistics.forVotesMVKTotal / totalMVKVoted) * 100
  const againstVotesWidth = (voteStatistics.againstVotesMVKTotal / totalMVKVoted) * 100
  const abstainingVotesWidth = (voteStatistics.abstainVotesMVKTotal / totalMVKVoted) * 100
  const unusedVotesWidth = (voteStatistics.unusedVotesMVKTotal / totalMVKVoted) * 100
  return (
    <VotingContainer>
      <QuorumBar width={53.61}>Quorum 53.61%</QuorumBar>
      <VotingBarStyled>
        <Tooltip title={`${voteStatistics.forVotesMVKTotal} Yay votes`}>
          <VotingFor width={forVotesWidth} />
        </Tooltip>
        <Tooltip title={`${voteStatistics.unusedVotesMVKTotal} Unused votes`}>
          <NotYetVoted width={unusedVotesWidth} />
        </Tooltip>
        <Tooltip title={`${voteStatistics.abstainVotesMVKTotal} Abstention votes`}>
          <VotingAbstention width={abstainingVotesWidth} />
        </Tooltip>

        <Tooltip title={`${voteStatistics.againstVotesMVKTotal} Nay votes`}>
          <VotingAgainst width={againstVotesWidth} />
        </Tooltip>
      </VotingBarStyled>
    </VotingContainer>
  )
}

VotingBarView.propTypes = {
  status: PropTypes.string,
}

VotingBarView.defaultProps = {
  status: VotingBarStatus.NO_DISPLAY,
}
