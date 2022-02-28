import { MichelsonMap } from '@taquito/taquito'

export enum ProposalStatus {
  EXECUTED = 'EXECUTED',
  DEFEATED = 'DEFEATED',
  ONGOING = 'ONGOING',
  DISCOVERY = 'DISCOVERY',
}

export interface GovernanceConfig {
  successReward: number
  minQuorumPercentage: number
  minQuorumMvkTotal: number
  votingPowerRatio: number
  proposalSubmissionFee: number // 10 tez
  minimumStakeReqPercentage: number // 0.01% for testing: change to 10,000 later -> 10%
  maxProposalsPerDelegate: number
  newBlockTimeLevel: number
  newBlocksPerMinute: number
  blocksPerMinute: number
  blocksPerProposalRound: number
  blocksPerVotingRound: number
  blocksPerTimelockRound: number
}
export type proposalMetadataType = Map<string, string>
export type proposalRoundVoteType = [number, Date] // total voting power (MVK) * timestamp
export type passVotersMapType = Map<string, proposalRoundVoteType>
export type votingRoundVoteType = [number, number, Date] // 1 is Yay, 0 is Nay, 2 is abstain * total voting power (MVK) * timestamp
export type votersMapType = Map<string, votingRoundVoteType>

export interface ProposalRecordType {
  id: number

  proposerAddress: string
  proposalMetadata: proposalMetadataType | {}
  status: ProposalStatus // status - "ACTIVE", "DROPPED"
  title: string // title
  description: string // description
  invoice: string // ipfs hash of invoice file
  successReward: number // log of successful proposal reward for voters - may change over time
  executed: boolean // true / false
  locked: boolean // true / false   For updating of the proposal metadata

  passVoteCount: number // proposal round: pass votes count - number of satellites
  passVoteMvkTotal: number // proposal round pass vote total mvk from satellites who voted pass
  passVotersMap: passVotersMapType | {} // proposal round ledger

  upvoteCount: number // voting round: upvotes count - number of satellites
  upvoteMvkTotal: number // voting round: upvotes MVK total
  downvoteCount: number // voting round: downvotes count - number of satellites
  downvoteMvkTotal: number // voting round: downvotes MVK total
  abstainCount: number // voting round: abstain count - number of satellites
  abstainMvkTotal: number // voting round: abstain MVK total
  voters: votersMapType | {} // voting round ledger

  minQuorumPercentage: number // log of min quorum percentage - capture state at this point as min quorum percentage may change over time
  minQuorumMvkTotal: number // log of min quorum in MVK - capture state at this point
  quorumCount: number // log of turnout for voting round - number of satellites who voted
  quorumMvkTotal: number // log of total positive votes in MVK
  startDateTime: Date // log of when the proposal was proposed

  currentCycleStartLevel: number // log of current cycle starting block level
  currentCycleEndLevel: number // log of current cycle end block level

  invoiceTable: string
  details?: string
  votedMVK?: number | 0
}

export interface SnapshotRecordType {
  totalMvkBalance: number // log of satellite's total mvk balance for this cycle
  totalDelegatedAmount: number // log of satellite's total delegated amount
  totalVotingPower: number // log calculated total voting power
  currentCycleStartLevel: number // log of current cycle starting block level
  currentCycleEndLevel: number // log of when cycle (proposal + voting) will end
}
export interface GovernanceStorage {
  admin: string
  config: GovernanceConfig
  whitelistContracts: MichelsonMap<string, unknown>
  whitelistTokenContracts: MichelsonMap<string, unknown>
  generalContracts: MichelsonMap<string, unknown>
  proposalLedger: MichelsonMap<string, ProposalRecordType>
  snapshotLedger: MichelsonMap<string, SnapshotRecordType>
  activeSatellitesMap: MichelsonMap<string, Date>
  startLevel: number
  nextProposalId: number
  currentRound: string
  currentRoundStartLevel: number
  currentRoundEndLevel: number
  currentCycleEndLevel: number
  currentRoundProposals: MichelsonMap<string, unknown>
  currentRoundVotes: MichelsonMap<string, unknown>
  currentRoundHighestVotedProposalId: number
  timelockProposalId: number
  snapshotMvkTotalSupply: number
  governanceLambdaLedger: MichelsonMap<string, unknown>
  financialRequestLedger: MichelsonMap<string, unknown>
  financialRequestSnapshotLedger: any
  financialRequestCounter: number
  tempFlag: number
}
