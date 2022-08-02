import { Tooltip } from '@mui/material'

import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'

import {
  NotYetVoted,
  QuorumBar,
  VotingBarStyled,
  VotingContainer,
  VotingFor,
} from '../../Governance/VotingArea/VotingBar/VotingBar.style'

type VotingViewProps = {
  totalStakedMvk: number
  totalsMvkVotes: number
  sMvkPercentageRequired: number
}

export const EGovVoting = ({ totalStakedMvk = 0, totalsMvkVotes = 0, sMvkPercentageRequired = 0 }: VotingViewProps) => {
  const yayVotesSmvkTotalWidth = (totalsMvkVotes / totalStakedMvk) * 100

  const unusedVotes = totalStakedMvk - totalsMvkVotes
  const unusedVotesWidth = (unusedVotes / totalStakedMvk) * 100

  const quorumWidth = sMvkPercentageRequired / 100

  return (
    <VotingContainer>
      <QuorumBar width={quorumWidth}>
        Percentage Required <b>{quorumWidth.toFixed(2)}%</b>
      </QuorumBar>
      <VotingBarStyled>
        <Tooltip title={`${totalsMvkVotes} Yay votes`}>
          <VotingFor width={yayVotesSmvkTotalWidth}>
            <CommaNumber value={totalsMvkVotes} />
          </VotingFor>
        </Tooltip>
        <Tooltip title={`${unusedVotes} Unused votes`}>
          <NotYetVoted width={unusedVotesWidth}>
            <CommaNumber value={unusedVotes} />
          </NotYetVoted>
        </Tooltip>
      </VotingBarStyled>
    </VotingContainer>
  )
}
