import type {ProposalRecordType} from 'utils/TypesAndInterfaces/Governance'

export type VoteStatistics = {
  forVotesMVKTotal: number
  againstVotesMVKTotal?: number
  abstainVotesMVKTotal?: number
  unusedVotesMVKTotal: number
  quorum: number
}

export type VotingProps = {
  voteStatistics: VoteStatistics
  isVotingActive: boolean
  showVotingButtons?: boolean
  handleVote?: (vote: string) => void
  quorumText?: string
}

export type VotingProposalsProps = {
  voteStatistics: VoteStatistics
  selectedProposal: ProposalRecordType
  currentProposalStage: {
    isPastProposals: boolean,
    isTimeLock: boolean
    isAbleToMakeProposalRoundVote: boolean
  }
  isAbleToMakeProposalRoundVote?: boolean
  handleProposalVote: (vote: number) => void
}

export type VotingBarProps = {
  voteStatistics: VoteStatistics
  quorumText?: string
}
