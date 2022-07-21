import { MichelsonMap } from '@taquito/taquito'

import { FinancialRequestVote, ProposalStatus, ProposalVote } from './Governance'

export interface SatelliteProposalVotingHistory extends ProposalVote {
  requestData: {
    id: number

    proposerId: string
    status: ProposalStatus // status - "ACTIVE", "DROPPED"
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
  }
}

export interface SatelliteFinancialRequestVotingHistory extends FinancialRequestVote {
  requestData: {
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

    requestedDatetime: Date
    expirationDatetime: Date

    tokenContractAddress: string
    tokenId: string
    tokenAmount: number
    tokenName: string

    snapshotsMvkTotalSupply: number
  }
}

export enum SatelliteStatus {
  ACTIVE = 0,
  SUSPENDED = 1,
  BANNED = 2,
  INACTIVE = 3,
}

export interface SatelliteRecord {
  address: string
  name: string
  image: string
  description: string
  website: string
  participation: number
  satelliteFee: number
  status: SatelliteStatus
  mvkBalance: number
  sMvkBalance: number
  totalDelegatedAmount: number
  registeredDateTime: Date
  unregisteredDateTime: Date | null
  proposalVotingHistory?: SatelliteProposalVotingHistory[]
  financialRequestsVotes?: SatelliteFinancialRequestVotingHistory[]
  emergencyGovernanceVotes?: SatelliteFinancialRequestVotingHistory[]
}

export type DelegationConfig = {
  maxSatellites: number
  delegationRatio: number
  minimumStakedMvkBalance: number
  satelliteNameMaxLength: number
  satelliteDescriptionMaxLength: number
  satelliteImageMaxLength: number
  satelliteWebsiteMaxLength: number
}

export type ParticipationMetrics = {
  pollParticipation: number
  proposalParticipation: number
  communication: number
}

export interface DelegationBreakGlassConfigType {
  delegateToSatelliteIsPaused: boolean
  undelegateFromSatelliteIsPaused: boolean
  registerAsSatelliteIsPaused: boolean
  unregisterAsSatelliteIsPaused: boolean
  updateSatelliteRecordIsPaused: boolean
  distributeRewardPaused: boolean
}

export interface DelegateRecord {
  satelliteAddress: string
  delegatedDateTime: Date | null
}

export type DelegationLedger = MichelsonMap<string, DelegateRecord>

export interface DelegationStorage {
  admin?: string
  contractAddresses?: MichelsonMap<string, string>
  whitelistContracts?: MichelsonMap<string, string>
  satelliteLedger: SatelliteRecord[]
  config: DelegationConfig
  delegateLedger: DelegationLedger
  breakGlassConfig: DelegationBreakGlassConfigType
  numberActiveSatellites: number
  totalDelegatedMVK: number
}
