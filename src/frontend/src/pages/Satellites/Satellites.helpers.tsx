import { MichelsonMap } from '@taquito/taquito'
// types
import type { DelegateRecord, SatelliteRecord } from '../../utils/TypesAndInterfaces/Delegation'
import type { MavrykUserGraphQl } from '../../utils/TypesAndInterfaces/User'
import type { SatelliteRecordGraphQl, DelegationGraphQl } from '../../utils/TypesAndInterfaces/Delegation'
import type { DataFeedsHistoryGraphQL, DataFeedsVolatility } from './helpers/Satellites.types'
import { GovernanceFinancialRequestGraphQL, ProposalRecordType } from 'utils/TypesAndInterfaces/Governance'
import { EmergergencyGovernanceItem } from 'utils/TypesAndInterfaces/EmergencyGovernance'

// helpers
import { calcWithoutPrecision } from '../../utils/calcFunctions'
import { symbolsAfterDecimalPoint } from '../../utils/symbolsAfterDecimalPoint'
import { Aggregator, Aggregator_Oracle } from 'utils/generated/graphqlTypes'
import { UTCTimestamp } from 'lightweight-charts'

export function normalizeSatelliteRecord(
  satelliteRecord: SatelliteRecordGraphQl,
  userVotingHistory: MavrykUserGraphQl,
): SatelliteRecord {
  const totalDelegatedAmount = satelliteRecord
    ? satelliteRecord.delegations.reduce(
        (sum: number, current: { user: { smvk_balance: number } }) => sum + current.user.smvk_balance,
        0,
      )
    : 0

  const proposalVotingHistory = userVotingHistory
    ? userVotingHistory?.governance_proposals_votes?.map((vote) => {
        return {
          id: vote.id,
          currentRoundVote: vote.current_round_vote,
          proposalId: vote.governance_proposal_id || 0,
          round: vote.round,
          timestamp: new Date(vote.timestamp as string),
          vote: vote.vote,
          voterId: vote.voter_id,
          votingPower: calcWithoutPrecision(vote.voting_power),
          requestData: vote.governance_proposal,
          voteName: vote?.governance_proposal?.title,
          submitted: vote.governance_proposal?.executed && vote.governance_proposal.locked,
        }
      })
    : []

  const financialRequestsVotes = userVotingHistory
    ? userVotingHistory.governance_financial_requests_votes?.map((vote) => {
        return {
          id: vote.id,
          proposalId: vote.governance_financial_request_id || 0,
          timestamp: new Date(vote.timestamp as string),
          vote: vote.vote,
          voterId: vote.voter_id,
          requestData: vote.governance_financial_request,
          voteName: vote?.governance_financial_request?.request_type,
        }
      })
    : []

  const emergencyGovernanceVotes = userVotingHistory
    ? userVotingHistory.emergency_governance_votes?.map((vote) => {
        return {
          id: vote.id,
          proposalId: vote.emergency_governance_record_id,
          timestamp: new Date(vote.timestamp as string),
          voterId: vote.voter_id,
          voteName: vote?.emergency_governance_record?.title,
        }
      })
    : []

  const satelliteActionVotes = userVotingHistory
    ? userVotingHistory.governance_satellite_actions_votes?.map((vote) => {
        return {
          id: vote.id,
          proposalId: vote.governance_satellite_action_id || 0,
          timestamp: new Date(vote.timestamp as string),
          vote: vote.vote,
          voterId: vote.voter_id,
          voteName: vote?.governance_satellite_action?.governance_type,
        }
      })
    : []

  const oracleRecords = (satelliteRecord?.user?.aggregator_oracles || []).map(
    ({ aggregator: { oracles, address: feedAddress }, user_id: oracleAddress }) => {
      // getting rewards for oracle per feed
      const { sMVKReward, XTZReward } = oracles.reduce(
        (acc, { rewards, user_id: rewardUserId }) => {
          rewards.forEach(({ type, reward }) => {
            if (type === 0 && rewardUserId === oracleAddress) {
              acc.XTZReward += reward
            }

            if (type === 1 && rewardUserId === oracleAddress) {
              acc.sMVKReward += reward
            }
          })

          return acc
        },
        {
          sMVKReward: 0,
          XTZReward: 0,
        },
      )

      // TODO: add calculation for oracle status
      const isActive = false //last_updated_at ? Date.now() - new Date(last_updated_at).getTime() < 24 * 60 * 60 * 1000 : false

      return {
        feedAddress,
        oracleAddress,
        active: isActive,
        sMVKReward,
        XTZReward,
      }
    },
  )

  const newSatelliteRecord: SatelliteRecord = {
    address: satelliteRecord?.user_id || '',
    oracleRecords,
    description: satelliteRecord?.description || '',
    website: satelliteRecord?.website || '',
    participation: 0,
    image: satelliteRecord?.image || '',
    mvkBalance: calcWithoutPrecision(satelliteRecord?.user.mvk_balance),
    sMvkBalance: calcWithoutPrecision(satelliteRecord?.user.smvk_balance),
    name: satelliteRecord?.name || '',
    satelliteFee: (satelliteRecord?.fee || 0) / 100,
    status: satelliteRecord?.status,
    delegationRatio: satelliteRecord?.delegation?.delegation_ratio / 10 ?? 0,
    delegatorCount: satelliteRecord?.delegations.length,
    totalDelegatedAmount: calcWithoutPrecision(totalDelegatedAmount),
    proposalVotingHistory,
    financialRequestsVotes,
    emergencyGovernanceVotes,
    satelliteActionVotes,
    currentlyRegistered: satelliteRecord.currently_registered,
    isSatelliteReady: satelliteRecord.currently_registered && satelliteRecord.status === 0,
  }

  return newSatelliteRecord
}

function convertToSatelliteRecords(satelliteRecordList: DelegationGraphQl['satellites']): {
  ledger: SatelliteRecord[]
  activeSatellites: SatelliteRecord[]
} {
  const ledger = satelliteRecordList?.length
    ? satelliteRecordList.map((item) => normalizeSatelliteRecord(item, item?.user))
    : []
  return {
    ledger,
    activeSatellites: ledger.filter(({ currentlyRegistered, status }) => currentlyRegistered && status === 0),
  }
}

function getOraclesAmount(satellites: SatelliteRecord[]) {
  return satellites.reduce((acc, { oracleRecords }) => {
    if (oracleRecords.length) {
      acc += 1
    }
    return acc
  }, 0)
}

export function normalizeDelegationStorage(delegationStorage: DelegationGraphQl) {
  const { ledger, activeSatellites } = convertToSatelliteRecords(delegationStorage?.satellites)

  return {
    breakGlassConfig: {
      delegateToSatelliteIsPaused: delegationStorage?.delegate_to_satellite_paused,
      undelegateFromSatelliteIsPaused: delegationStorage?.undelegate_from_satellite_paused,
      registerAsSatelliteIsPaused: delegationStorage?.register_as_satellite_paused,
      unregisterAsSatelliteIsPaused: delegationStorage?.unregister_as_satellite_paused,
      updateSatelliteRecordIsPaused: delegationStorage?.update_satellite_record_paused,
      distributeRewardPaused: delegationStorage?.distribute_reward_paused,
    },
    config: {
      maxSatellites: delegationStorage?.max_satellites,
      delegationRatio: delegationStorage?.delegation_ratio,
      minimumStakedMvkBalance: calcWithoutPrecision(delegationStorage?.minimum_smvk_balance),
      satelliteNameMaxLength: delegationStorage?.satellite_name_max_length || 400,
      satelliteDescriptionMaxLength: delegationStorage?.satellite_description_max_length || 500,
      satelliteImageMaxLength: delegationStorage?.satellite_image_max_length || 400,
      satelliteWebsiteMaxLength: delegationStorage?.satellite_website_max_length || 400,
    },
    delegateLedger: new MichelsonMap<string, DelegateRecord>(),
    satelliteLedger: ledger,
    activeSatellites,
    oraclesAmount: getOraclesAmount(ledger),
    numberActiveSatellites: delegationStorage?.max_satellites,
    totalDelegatedMVK: delegationStorage?.max_satellites,
  }
}

// Data Feeds History Normalizer
type DataFeedsHistoryProps = {
  aggregator_history_data: DataFeedsHistoryGraphQL[]
}

export function normalizeDataFeedsHistory(storage: DataFeedsHistoryProps) {
  const { aggregator_history_data = [] } = storage

  return aggregator_history_data?.length
    ? aggregator_history_data.map((item) => {
        return {
          time: new Date(item.timestamp).getTime() as UTCTimestamp,
          // TODO: ask Sam if the decimal is right we use?
          value: symbolsAfterDecimalPoint(item.data / 10 ** item.aggregator.decimals),
        }
      })
    : []
}

export function normalizeDataFeedsVolatility(storage: DataFeedsHistoryProps): DataFeedsVolatility {
  const { aggregator_history_data = [] } = storage

  return aggregator_history_data?.length >= 2
    ? aggregator_history_data.map(({ data, aggregator: { decimals }, timestamp }, idx, arr) => {
        return {
          time: new Date(timestamp).getTime() as UTCTimestamp,
          value: percentageDifference(
            symbolsAfterDecimalPoint(data / 10 ** decimals),
            symbolsAfterDecimalPoint(arr[idx - 1]?.data / 10 ** decimals),
          ),
        }
      })
    : []
}

export const percentageDifference = (a: number, b: number): number => {
  const twoNumberDifference = (a / b - 1) * 100

  return Number(twoNumberDifference.toFixed(2))
}

export const getSatelliteMetrics = (
  pastProposals: Array<ProposalRecordType>,
  proposalLedger: Array<ProposalRecordType>,
  emergencyGovernanceLedger: Array<EmergergencyGovernanceItem>,
  satellite: SatelliteRecord,
  feeds?: Array<Aggregator>,
  financialRequestLedger?: Array<GovernanceFinancialRequestGraphQL>,
) => {
  const submittedProposalsCount = pastProposals
    .concat(proposalLedger)
    .reduce((acc, { locked, executed }) => (acc += locked && executed ? 1 : 0), 0)
  const totalVotingPeriods =
    (emergencyGovernanceLedger.length ?? 0) +
    (financialRequestLedger?.length ?? 0) +
    (proposalLedger.length ?? 0) +
    (pastProposals.length ?? 0)

  const votedProposalSubmitted =
    satellite.proposalVotingHistory?.reduce((acc, { submitted }) => (submitted ? (acc += 1) : acc), 0) ?? 0
  const satelliteVotes =
    (satellite.emergencyGovernanceVotes?.length ?? 0) +
    (satellite.satelliteActionVotes?.length ?? 0) +
    (satellite.proposalVotingHistory?.length ?? 0) +
    (satellite.financialRequestsVotes?.length ?? 0)

  const observationsForSatellite = feeds
    ?.reduce<Aggregator_Oracle['observations']>(
      (acc, { oracles }) => acc.concat(...oracles.map(({ observations }) => observations)),
      [],
    )
    ?.filter(({ oracle: { user_id } }) => user_id === satellite.address)
    ?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const latestObservation = observationsForSatellite?.[0]
  const numberOfObservations = observationsForSatellite?.length ?? 0
  const epochRoundRatio =
    (latestObservation?.epoch ?? 0) / (latestObservation?.round || 1) -
    (latestObservation?.oracle?.init_epoch ?? 0) / (latestObservation?.oracle?.init_round || 1)
  const oracleEfficiency = (numberOfObservations / Math.max(epochRoundRatio, 1)) * 100

  return {
    proposalParticipation: (votedProposalSubmitted / submittedProposalsCount) * 100,
    votingPartisipation: (satelliteVotes / totalVotingPeriods) * 100,
    oracleEfficiency,
  }
}
