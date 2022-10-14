import { MichelsonMap } from '@taquito/taquito'
// types
import type { DelegateRecord, SatelliteRecord } from '../../utils/TypesAndInterfaces/Delegation'
import type { MavrykUserGraphQl } from '../../utils/TypesAndInterfaces/User'
import type { SatelliteRecordGraphQl, DelegationGraphQl } from '../../utils/TypesAndInterfaces/Delegation'
import type { DataFeedsHistoryGraphQL } from './helpers/Satellites.types'
// helpers
import { calcWithoutMu, calcWithoutPrecision } from '../../utils/calcFunctions'

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
    ({ aggregator: { oracles, address: feedAddress }, user_id: oracleAddress, last_updated_at }) => {
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

      const isActive = last_updated_at ? Date.now() - new Date(last_updated_at).getTime() < 24 * 60 * 60 * 1000 : false

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
    unregisteredDateTime: new Date(0),
    proposalVotingHistory,
    financialRequestsVotes,
    emergencyGovernanceVotes,
    satelliteActionVotes,
  }

  return newSatelliteRecord
}

function convertToSatelliteRecords(satelliteRecordList: DelegationGraphQl['satellites']): SatelliteRecord[] {
  return satelliteRecordList?.length
    ? satelliteRecordList.map((item) => normalizeSatelliteRecord(item, item?.user))
    : []
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
  const convertedSatellties = convertToSatelliteRecords(delegationStorage?.satellites)
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
      minimumStakedMvkBalance: calcWithoutMu(delegationStorage?.minimum_smvk_balance),
      satelliteNameMaxLength: delegationStorage?.satellite_name_max_length,
      satelliteDescriptionMaxLength: delegationStorage?.satellite_description_max_length,
      satelliteImageMaxLength: delegationStorage?.satellite_image_max_length,
      satelliteWebsiteMaxLength: delegationStorage?.satellite_website_max_length,
    },
    delegateLedger: new MichelsonMap<string, DelegateRecord>(),
    satelliteLedger: convertedSatellties,
    oraclesAmount: getOraclesAmount(convertedSatellties),
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
          // aggregator: item.aggregator,
          // aggregatorId: item.aggregator_id,
          // data: item.data,
          // epoch: item.epoch,
          // id: item.id,
          // lambdaBytes: item.lambda_bytes,
          // lambdaName: item.lambda_name,
          // lastUpdatedAt: item.last_updated_at,
          // pctOracleResp: item.pct_oracle_resp,
          // round: item.round,
          // timestamp: item.timestamp,
          xAxis: item.timestamp,
          yAxis: item.data,
        }
      })
    : []
}
