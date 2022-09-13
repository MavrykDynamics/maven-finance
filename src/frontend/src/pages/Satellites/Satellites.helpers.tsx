import { MichelsonMap } from '@taquito/taquito'
// types
import type { DelegateRecord, SatelliteRecord } from '../../utils/TypesAndInterfaces/Delegation'
import type { MavrykUserGraphQl } from '../../utils/TypesAndInterfaces/User'
import type { SatelliteRecordGraphQl, DelegationGraphQl } from '../../utils/TypesAndInterfaces/Delegation'

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

  const oracleRecords = (satelliteRecord?.user?.aggregator_oracles || []).map(({ oracle, ...rest }) => {
    return {
      ...rest,
      // @ts-ignore
      sMVKReward: oracle?.aggregator_oracle_rewards_smvk?.[0]?.smvk || 0,
      // @ts-ignore
      XTZReward: oracle?.aggregator_oracle_rewards_xtz?.[0]?.xtz || 0,
    }
  })

  const newSatelliteRecord: SatelliteRecord = {
    address: satelliteRecord?.user_id || '',
    // @ts-ignore
    oracleRecords,
    description: satelliteRecord?.description || '',
    website: satelliteRecord?.website || '',
    participation: 0,
    image: satelliteRecord?.image || '',
    mvkBalance: calcWithoutPrecision(satelliteRecord?.user.mvk_balance),
    sMvkBalance: calcWithoutPrecision(satelliteRecord?.user.smvk_balance),
    name: satelliteRecord?.name || '',
    satelliteFee: (satelliteRecord?.fee || 0) / 100, //- not exist
    status: satelliteRecord?.status,
    delegatorCount: satelliteRecord?.delegations.length,
    totalDelegatedAmount: calcWithoutPrecision(totalDelegatedAmount),
    // unregisteredDateTime: new Date(satelliteRecord?.unregistered_datetime), not exist
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

export function normalizeDelegationStorage(delegationStorage: DelegationGraphQl) {
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
    satelliteLedger: convertToSatelliteRecords(delegationStorage?.satellites),
    numberActiveSatellites: delegationStorage?.max_satellites,
    totalDelegatedMVK: delegationStorage?.max_satellites,
  }
}
