export type VoteStatistics = {
  forVotesMVKTotal: number
  againstVotesMVKTotal?: number
  abstainVotesMVKTotal?: number
  unusedVotesMVKTotal: number
  quorum: number
}

export type VotingProps = {
  isVisibleHistoryProposal?: boolean
  selectedProposal?: {
    passVoteMvkTotal: number
    id: number | string
  }
  isAbleToMakeProposalRoundVote?: boolean

  voteStatistics: VoteStatistics
  isVotingActive: boolean
  showVotingButtons?: boolean
  handleVote: (vote: string) => void
  quorumText?: string
}

export type VotingBarProps = {
  voteStatistics: VoteStatistics
  quorumText?: string
}
