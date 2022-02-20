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

type ProgressBarViewProps = {
  status: VotingBarStatus
  loading: boolean
  forVotes: number
  againstVotes: number
  abstainingVotes: number
  unusedVotes: number
}

export const VotingBarView = ({
  status,
  forVotes,
  againstVotes,
  abstainingVotes,
  unusedVotes,
}: ProgressBarViewProps) => {
  const totalVotes = forVotes + againstVotes + abstainingVotes + unusedVotes
  const forVotesWidth = (forVotes / totalVotes) * 100
  const againstVotesWidth = (againstVotes / totalVotes) * 100
  const abstainingVotesWidth = (abstainingVotes / totalVotes) * 100
  const unusedVotesWidth = (unusedVotes / totalVotes) * 100
  return (
    <VotingContainer>
      <QuorumBar width={53.61}>Quorum 53.61%</QuorumBar>
      <VotingBarStyled>
        <Tooltip title={`${forVotes} Yay votes`}>
          <VotingFor width={forVotesWidth} />
        </Tooltip>
        <Tooltip title={`${abstainingVotes} Abstention votes`}>
          <VotingAbstention width={abstainingVotesWidth} />
        </Tooltip>
        <Tooltip title={`${unusedVotes} Unused votes`}>
          <NotYetVoted width={unusedVotesWidth} />
        </Tooltip>
        <Tooltip title={`${againstVotes} Nay votes`}>
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
