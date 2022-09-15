import { MichelsonMap } from '@taquito/taquito'
import type { Satellite, Delegation } from '../generated/graphqlTypes'
import { Governance_Proposal, Maybe, Governance_Financial_Request } from '../generated/graphqlTypes'

import { FinancialRequestVote, ProposalVote } from './Governance'

import { normalizeDelegationStorage } from '../../pages/Satellites/Satellites.helpers'

export interface SatelliteProposalVotingHistory extends ProposalVote {
  requestData: Maybe<Governance_Proposal> | undefined
  voteName?: string
}

export interface SatelliteFinancialRequestVotingHistory extends FinancialRequestVote {
  requestData?: Maybe<Governance_Financial_Request> | undefined
  voteName?: string
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
  delegatorCount: number
  status: SatelliteStatus
  mvkBalance: number
  sMvkBalance: number
  totalDelegatedAmount: number
  unregisteredDateTime: Date | null
  proposalVotingHistory?: SatelliteProposalVotingHistory[]
  financialRequestsVotes?: SatelliteFinancialRequestVotingHistory[]
  emergencyGovernanceVotes?: SatelliteFinancialRequestVotingHistory[]
  satelliteActionVotes?: SatelliteFinancialRequestVotingHistory[]
  oracleRecords: Array<{ active: boolean; oracle_id: string; sMVKReward: number; XTZReward: number; aggregator: {address: string} }>
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
type TokenType = 'FA12' | 'FA2' | 'TEZ'

export type SatelliteGovernanceTransfer = {
  to_: string //this is a contract address
  amount: number
  token: TokenType
}

export type DelegationStorage = ReturnType<typeof normalizeDelegationStorage>
export type SatelliteRecordGraphQl = Omit<Satellite, '__typename'>
export type DelegationGraphQl = Omit<Delegation, '__typename'>
