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
      emergency_governance_records {
        description
        dropped
        emergency_governance_id
        executed
        executed_timestamp
        expiration_timestamp
        id
        proposer_id
        smvk_percentage_required
        smvk_required_for_trigger
        start_timestamp
        status
        title
        voters {
          emergency_governance_record_id
          id
          smvk_amount
          timestamp
          voter_id
        }
      }
      required_fee_mutez
      proposal_title_max_length
      proposal_desc_max_length
      governance_id
      decimals
    }
  }
`

export const EMERGENCY_GOVERNANCE_STORAGE_QUERY_NAME = 'GetEmergencyGovernanceStorageQuery'
export const EMERGENCY_GOVERNANCE_STORAGE_QUERY_VARIABLE = {}
