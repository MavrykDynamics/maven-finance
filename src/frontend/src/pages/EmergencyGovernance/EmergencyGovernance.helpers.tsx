import { EmergencyGovernanceGraphQl } from '../../utils/TypesAndInterfaces/EmergencyGovernance'

// helpers
import { calcWithoutMu, calcWithoutPrecision } from '../../utils/calcFunctions'

export function normalizeEmergencyGovernance(storage: EmergencyGovernanceGraphQl) {
  const eGovRecords = storage?.emergency_governance_records?.length
    ? storage.emergency_governance_records.map((record) => {
        const voters = record.voters?.length
          ? record.voters.map((voter) => {
              return {
                emergencyGovernanceRecordId: voter.emergency_governance_record_id,
                id: voter.id,
                sMvkAmount: voter.smvk_amount,
                timestamp: new Date(voter.timestamp as string),
                voterId: voter.voter_id,
              }
            })
          : []

        return {
          id: record.id,
          title: record.title,
          description: record.description,
          executedLevel: record.executed_level,
          startLevel: record.start_level,
          dropped: record.dropped,
          executed: record.executed,
          proposerId: record.proposer_id,
          emergencyGovernanceId: record.emergency_governance_id,
          startTimestamp: new Date(record.start_timestamp as string),
          executedTimestamp: new Date(record.executed_timestamp as string),
          expirationTimestamp: new Date(record.expiration_timestamp as string),
          sMvkPercentageRequired: record.smvk_percentage_required / 100,
          sMvkRequiredForTrigger: calcWithoutPrecision(record.smvk_required_for_trigger),
          totalsMvkVotes: calcWithoutPrecision(record.total_smvk_votes),
          voters,
        }
      })
    : []
  return {
    emergencyGovernanceLedger: eGovRecords,
    address: storage?.address,
    config: {
      minStakedMvkRequiredToTrigger: calcWithoutPrecision(storage?.min_smvk_required_to_trigger),
      minStakedMvkRequiredToVote: calcWithoutPrecision(storage?.min_smvk_required_to_vote),
      requiredFeeMutez: calcWithoutMu(storage?.required_fee_mutez),
      voteExpiryDays: storage?.vote_expiry_days,
      sMvkPercentageRequired: storage?.smvk_percentage_required / 100,
      proposalTitleMaxLength: 400,
      proposalDescMaxLength: 400,
      decimals: storage?.decimals,
    },
    currentEmergencyGovernanceRecordId: storage?.current_emergency_record_id,
    nextEmergencyGovernanceRecordId: storage?.next_emergency_record_id,
  }
}
