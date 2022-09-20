import { Tooltip } from 'recharts'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { CustomTooltip } from '../Tooltip/Tooltip.view'
import { VotingBarProps } from './helpers/voting'
import {
  NotYetVoted,
  QuorumBar,
  VotingAbstention,
  VotingAgainst,
  VotingBarStyled,
  VotingContainer,
  VotingFor,
} from './VotingBar.style'

export const VotingBar = ({
  voteStatistics: { forVotesMVKTotal, againstVotesMVKTotal, abstainVotesMVKTotal, unusedVotesMVKTotal, quorum },
}: VotingBarProps) => {
  const totalVotes = forVotesMVKTotal + againstVotesMVKTotal + abstainVotesMVKTotal + unusedVotesMVKTotal

  const forVotesWidth = (forVotesMVKTotal / totalVotes) * 100
  const againstVotesWidth = (againstVotesMVKTotal / totalVotes) * 100
  const abstainingVotesWidth = (abstainVotesMVKTotal / totalVotes) * 100
  const unusedVotesWidth = (unusedVotesMVKTotal / totalVotes) * 100

  return (
    <VotingContainer>
      <QuorumBar width={quorum}>
        <div className="text">
          Quorum <b>{quorum}%</b>
        </div>
      </QuorumBar>
      <VotingBarStyled>
        <VotingFor width={forVotesWidth}>
          <CommaNumber value={forVotesMVKTotal} />
        </VotingFor>
        <VotingAbstention width={abstainingVotesWidth}>
          <CommaNumber value={abstainVotesMVKTotal} />
        </VotingAbstention>
        <NotYetVoted width={unusedVotesWidth}>
          <CommaNumber value={unusedVotesMVKTotal} />
        </NotYetVoted>

        <VotingAgainst width={againstVotesWidth}>
          <CommaNumber value={againstVotesMVKTotal} />
        </VotingAgainst>
      </VotingBarStyled>
    </VotingContainer>
  )
}
