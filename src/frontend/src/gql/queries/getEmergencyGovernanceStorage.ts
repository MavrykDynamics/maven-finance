export const EMERGENCY_GOVERNANCE_STORAGE_QUERY = `
  query GetEmergencyGovernanceStorageQuery {
    emergency_governance {
      address
      current_emergency_record_id
      min_smvk_required_to_vote
      next_emergency_record_id
      smvk_percentage_required
      min_smvk_required_to_trigger
      vote_expiry_days
      required_fee_mutez
      proposal_title_max_length
      proposal_desc_max_length
      governance_id
      decimals
      admin
      emergency_governance_records {
        description
        dropped
        emergency_governance_id
        executed
        execution_datetime
        expiration_timestamp
        id
        proposer_id
        smvk_percentage_required
        smvk_required_for_trigger
        start_timestamp
        title
        voters {
          emergency_governance_record_id
          id
          smvk_amount
          timestamp
          voter_id
        }
        execution_level
        start_level
        total_smvk_votes
      }
    }
  }
`

export const EMERGENCY_GOVERNANCE_STORAGE_QUERY_NAME = 'GetEmergencyGovernanceStorageQuery'
export const EMERGENCY_GOVERNANCE_STORAGE_QUERY_VARIABLE = {}
