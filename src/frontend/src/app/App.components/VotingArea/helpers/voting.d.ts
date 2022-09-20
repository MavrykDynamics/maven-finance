export type VoteStatistics = {
  forVotesMVKTotal: number
  againstVotesMVKTotal: number
  abstainVotesMVKTotal: number
  unusedVotesMVKTotal: number
  quorum: number
}

export type VotingProps = {
  isVisibleHistoryProposal?: boolean
  selectedProposal: {
    passVoteMvkTotal: number
    id: number | string
  }
  voteStatistics: VoteStatistics
  isAbleToMakeProposalRoundVote?: boolean

  isVotingActive: boolean
  showVotingButtons?: boolean
  handleVote: (vote: string | number) => void
}

export type VotingBarProps = {
  voteStatistics: VoteStatistics
}
