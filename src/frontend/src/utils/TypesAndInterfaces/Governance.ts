// type
import type {
  Governance,
  Maybe,
  // TODO: check this token replacement
  // Token,
  Governance_Satellite,
  Governance_Financial_Request,
  Governance_Proposal,
  Governance_Satellite_Snapshot,
  Governance_Satellite_Action,
  Governance_Proposal_Payment,
  Governance_Proposal_Data,
} from '../generated/graphqlTypes'
import { normalizeGovernanceStorage, normalizeProposal } from '../../pages/Governance/Governance.helpers'
// TODO: check this token replacement
export type TokenGraphQL = Maybe<any> | undefined
export type GovernanceGraphQL = Omit<Governance, '__typename'>
export type GovernanceFinancialRequestGraphQL = Omit<Governance_Financial_Request, '__typename'>
export type GovernanceProposalGraphQL = Omit<Governance_Proposal, '__typename'>
export type GovernanceSatelliteSnapshotGraphQL = Omit<Governance_Satellite_Snapshot, '__typename'>
export type GovernanceSatelliteActionGraphQL = Omit<Governance_Satellite_Action, '__typename'>
export type GovernanceSatelliteGraphQL = Omit<Governance_Satellite, '__typename'>
export type GovernanceStorageGraphQL = {
  governance: GovernanceGraphQL[]
  governance_financial_request: GovernanceFinancialRequestGraphQL[]
  governance_proposal: GovernanceProposalGraphQL[]
}

export type GovernanceStorage = ReturnType<typeof normalizeGovernanceStorage>
export type ProposalRecordType = ReturnType<typeof normalizeProposal>

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

export type ProposalDataType = Governance_Proposal_Data

export type TokenStandardType = 0 | 1 | 2 | 3
export type PaymentType = 'XTZ' | 'MVK'

export type ProposalPaymentType = Governance_Proposal_Payment

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
