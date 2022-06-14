import { MichelsonMap } from '@taquito/taquito'

export enum ProposalStatus {
  EXECUTED = 'EXECUTED',
  DEFEATED = 'DEFEATED',
  ONGOING = 'ONGOING',
  DISCOVERY = 'DISCOVERY',
  WAITING = 'WAITING',
  DROPPED = 'DROPPED',
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  ACTIVE = 'ACTIVE',
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

export interface ProposalVote {
  id: string
  currentRoundVote: string
  proposalId: number
  round: string
  timestamp: Date
  vote: number
  voterId: string
  votingPower: number
}
export interface ProposalRecordType {
  id: number

  proposerId: string
  status: number
  title: string // title
  description: string // description
  invoice: string // ipfs hash of invoice file
  successReward: number // log of successful proposal reward for voters - may change over time
  startDateTime: Date // log of when the proposal was proposed
  executed: boolean // true / false
  locked: boolean // true / false   For updating of the proposal metadata
  timelockProposal: any

  passVoteMvkTotal: number // proposal round pass vote total mvk from satellites who voted pass
  upvoteMvkTotal: number // voting round: upvotes MVK total
  downvoteMvkTotal: number // voting round: downvotes MVK total
  abstainMvkTotal: number // voting round: abstain MVK total
  votes: Map<string, ProposalVote>

  minProposalRoundVoteRequirement: number
  minProposalRoundVotePercentage: number
  minQuorumPercentage: number // log of min quorum percentage - capture state at this point as min quorum percentage may change over time
  minQuorumMvkTotal: number // log of min quorum in MVK - capture state at this point
  quorumMvkTotal: number // log of total positive votes in MVK

  currentRoundProposal: string
  currentCycleStartLevel: number // log of current cycle starting block level
  currentCycleEndLevel: number // log of current cycle end block level

  roundHighestVotedProposal: string
  cycle: number

  //To possibly add:
  details: string
  invoiceTable: string
}

export interface SnapshotRecordType {
  id: number
  satelliteId: number // satellite_id
  governance_id: number // governance_id
  totalMvkBalance: number // total_mvk_balance: log of satellite's total mvk balance for this cycle
  totalDelegatedAmount: number // log of satellite's total delegated amount
  totalVotingPower: number // log calculated total voting power
  currentCycleStartLevel: number // log of current cycle starting block level
  currentCycleEndLevel: number // log of when cycle (proposal + voting) will end
}
export interface GovernanceStorage {
  address: string
  fee: number
  config: GovernanceConfig
  whitelistTokenContracts?: MichelsonMap<string, unknown>
  proposalLedger: ProposalRecordType[]
  snapshotLedger: SnapshotRecordType[]
  activeSatellitesMap: MichelsonMap<string, Date>
  startLevel: number
  nextProposalId: number
  currentRound: string
  currentRoundStartLevel: number
  currentRoundEndLevel: number
  currentCycleEndLevel: number
  currentRoundProposals?: MichelsonMap<string, ProposalRecordType>
  currentRoundVotes?: MichelsonMap<string, unknown>
  currentRoundHighestVotedProposalId?: number
  timelockProposalId: number
  snapshotMvkTotalSupply?: number
  governanceLambdaLedger?: MichelsonMap<string, unknown>
  financialRequestLedger?: FinancialRequestRecord[]
  financialRequestSnapshotLedger?: any
  financialRequestCounter?: number
  tempFlag: number
  cycleCounter: number
}

export interface FinancialRequestRecord {
  id: string
  governanceId: string
  treasuryId: string
  executed: boolean
  ready: boolean
  status: string | boolean

  requesterId: string
  requestPurpose: string
  requestType: string
  smvkPercentageForApproval: number
  smvkRequiredForApproval: number
  approveVoteTotal: number
  disapproveVoteTotal: number
  votes: FinancialRequestVote[]
  requestedDatetime: Date
  expirationDatetime: Date

  tokenContractAddress: string
  tokenId: string
  tokenAmount: number
  tokenName: string

  snapshotsMvkTotalSupply: number
}

export interface FinancialRequestVote {
  id: string
  proposalId: string
  timestamp: Date
  vote: number
  voterId: string
  votingPower: number
}


export type GovernanceRoundType = 'VOTING' | 'TIME_LOCK' | 'PROPOSAL'
export type ProposalStatusType = string
export type CurrentRoundProposalsStorageType = ProposalRecordType[]

