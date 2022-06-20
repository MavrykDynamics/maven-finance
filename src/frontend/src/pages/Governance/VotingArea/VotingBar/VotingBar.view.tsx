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
  status: VotingBarStatus
  loading: boolean
  totalMVKVoted: number
  voteStatistics: VoteStatistics
  totalCirculatingMVKSupply: number
}

export const VotingBarView = ({
  status,
  totalMVKVoted,
  voteStatistics,
  totalCirculatingMVKSupply,
}: VotingViewProps) => {
  // //test
  // voteStatistics = {
  //   passVotesMVKTotal: 1000,
  //   forVotesMVKTotal: 1500,
  //   againstVotesMVKTotal: 2000,
  //   abstainVotesMVKTotal: 3000,
  //   unusedVotesMVKTotal: 20,
  // }
  // totalMVKVoted = 100000
  // totalCirculatingMVKSupply = 500

  const forVotesWidth = (voteStatistics.forVotesMVKTotal / totalCirculatingMVKSupply) * 100
  const againstVotesWidth = (voteStatistics.againstVotesMVKTotal / totalCirculatingMVKSupply) * 100
  const abstainingVotesWidth = (voteStatistics.abstainVotesMVKTotal / totalCirculatingMVKSupply) * 100
  const unusedVotesWidth = ((totalCirculatingMVKSupply - totalMVKVoted) / totalCirculatingMVKSupply) * 100
  const quorum = (totalCirculatingMVKSupply ?? 0) * 0.05
  const quorumWidth = (quorum / (totalCirculatingMVKSupply ?? 1)) * 100
  // //test
  // const quorumWidth = 50

  return (
    <VotingContainer>
      <QuorumBar width={quorumWidth}>
        Quorum <b>{quorumWidth.toFixed(0)}%</b>
      </QuorumBar>
      <VotingBarStyled>
        <Tooltip title={`${voteStatistics.forVotesMVKTotal} Yay votes`}>
          <VotingFor width={forVotesWidth}>
            <CommaNumber value={voteStatistics.forVotesMVKTotal} />
          </VotingFor>
        </Tooltip>
        <Tooltip title={`${voteStatistics.abstainVotesMVKTotal} Abstention votes`}>
          <VotingAbstention width={abstainingVotesWidth}>
            <CommaNumber value={voteStatistics.abstainVotesMVKTotal} />
          </VotingAbstention>
        </Tooltip>
        <Tooltip title={`${voteStatistics.unusedVotesMVKTotal} Unused votes`}>
          <NotYetVoted width={unusedVotesWidth}>
            <CommaNumber value={voteStatistics.unusedVotesMVKTotal} />
          </NotYetVoted>
        </Tooltip>

        <Tooltip title={`${voteStatistics.againstVotesMVKTotal} Nay votes`}>
          <VotingAgainst width={againstVotesWidth}>
            <CommaNumber value={voteStatistics.againstVotesMVKTotal} />
          </VotingAgainst>
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
