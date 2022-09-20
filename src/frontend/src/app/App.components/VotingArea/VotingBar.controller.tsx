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
          <CustomTooltip text={`${forVotesWidth.toFixed(2)}%`} className="voting-tooltip" />
          <CommaNumber value={forVotesMVKTotal} />
        </VotingFor>

        <VotingAbstention width={abstainingVotesWidth}>
          <CustomTooltip text={`${abstainingVotesWidth.toFixed(2)}%`} className="voting-tooltip" />
          <CommaNumber value={abstainVotesMVKTotal} />
        </VotingAbstention>

        <NotYetVoted width={unusedVotesWidth}>
          <CustomTooltip text={`${unusedVotesWidth.toFixed(2)}%`} className="voting-tooltip" />
          <CommaNumber value={unusedVotesMVKTotal} />
        </NotYetVoted>

        <VotingAgainst width={againstVotesWidth}>
          <CustomTooltip text={`${againstVotesWidth.toFixed(2)}%`} className="voting-tooltip" />
          <CommaNumber value={againstVotesMVKTotal} />
        </VotingAgainst>
      </VotingBarStyled>
    </VotingContainer>
  )
}
