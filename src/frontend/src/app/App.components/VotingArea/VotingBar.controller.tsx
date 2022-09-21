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
  quorumText = 'Quorum',
}: VotingBarProps) => {
  const totalVotes = forVotesMVKTotal + (againstVotesMVKTotal ?? 0) + (abstainVotesMVKTotal ?? 0) + unusedVotesMVKTotal

  let forVotesWidth = (forVotesMVKTotal / totalVotes) * 100
  let againstVotesWidth = ((againstVotesMVKTotal ?? 0) / totalVotes) * 100
  let abstainingVotesWidth = ((abstainVotesMVKTotal ?? 0) / totalVotes) * 100
  let unusedVotesWidth = (unusedVotesMVKTotal / totalVotes) * 100

  if (totalVotes === 0) {
    forVotesWidth = 25
    againstVotesWidth = 25
    abstainingVotesWidth = 25
    unusedVotesWidth = 25
  }

  return (
    <VotingContainer>
      <QuorumBar width={quorum}>
        <div className="text">
          {quorumText} <b>{quorum}%</b>
        </div>
      </QuorumBar>
      <VotingBarStyled>
        <VotingFor width={forVotesWidth}>
          <CustomTooltip text={`${forVotesMVKTotal.toFixed(0)} yay votes`} className="voting-tooltip" />
          <CommaNumber value={forVotesMVKTotal} />
        </VotingFor>

        {abstainVotesMVKTotal !== undefined ? (
          <VotingAbstention width={abstainingVotesWidth}>
            <CustomTooltip text={`${abstainVotesMVKTotal.toFixed(0)} abstention votes`} className="voting-tooltip" />
            <CommaNumber value={abstainVotesMVKTotal} />
          </VotingAbstention>
        ) : null}

        <NotYetVoted width={unusedVotesWidth}>
          <CustomTooltip text={`${unusedVotesMVKTotal.toFixed(0)} unused votes`} className="voting-tooltip" />
          <CommaNumber value={unusedVotesMVKTotal} />
        </NotYetVoted>

        {againstVotesMVKTotal !== undefined ? (
          <VotingAgainst width={againstVotesWidth}>
            <CustomTooltip text={`${againstVotesWidth.toFixed(0)} nay votes`} className="voting-tooltip" />
            <CommaNumber value={againstVotesMVKTotal} />
          </VotingAgainst>
        ) : null}
      </VotingBarStyled>
    </VotingContainer>
  )
}
