// type
import { MichelsonMap } from '@taquito/taquito'
import type {
  Governance,
  Governance_Financial_Request_Record,
  Governance_Proposal_Record,
  Governance_Satellite_Snapshot_Record,
} from '../generated/graphqlTypes'
import { normalizeGovernanceStorage } from '../../pages/Governance/Governance.helpers'

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
  TIMELOCK = 'TIMELOCK',
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
  id: number
  currentRoundVote: boolean
  proposalId: number
  round: number
  timestamp: Date
  vote: number
  voterId: string
  votingPower: number
}

export interface ProposalDataType {
  bytes: string
  governance_proposal_record_id: number
  id: number
  record_internal_id: number
  title: string
}

export type TokenStandardType = 0 | 1 | 2 | 3
export type PaymentType = 'XTZ' | 'MVK'

export interface ProposalPaymentType {
  governance_proposal_record_id: number
  id: number
  record_internal_id: number
  title: string
  to__id: string
  token_address: string
  token_amount: string
  token_id: string
  token_standard: 0 | 1 | 2 | 3
}

export interface ProposalRecordType {
  id: number
  paymentProcessed?: boolean
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
  sourceCode?: string
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
  proposalData?: ProposalDataType[]
  proposalPayments?: ProposalPaymentType[]
  governanceId?: string
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
  id: number
  proposalId: number
  timestamp: Date
  voterId: string
  vote?: number
  votingPower?: number
}

export type GovernanceRoundType = 'VOTING' | 'TIME_LOCK' | 'PROPOSAL' | ''
export type ProposalStatusType = string
export type CurrentRoundProposalsStorageType = ProposalRecordType[]

export type GovernanceGraphQL = Omit<Governance, '__typename'>
export type GovernanceFinancialRequestRecordGraphQL = Omit<Governance_Financial_Request_Record, '__typename'>
export type GovernanceProposalRecordGraphQL = Omit<Governance_Proposal_Record, '__typename'>
export type GovernanceSatelliteSnapshotRecordGraphQL = Omit<Governance_Satellite_Snapshot_Record, '__typename'>
export type GovernanceStorageGraphQL = {
  governance: GovernanceGraphQL[]
  governance_financial_request_record: GovernanceFinancialRequestRecordGraphQL[]
  governance_proposal_record: GovernanceProposalRecordGraphQL[]
}

export type GovernanceStorage = ReturnType<typeof normalizeGovernanceStorage>
