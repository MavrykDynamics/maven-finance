export const GOVERNANCE_SATELLITE_STORAGE_QUERY = `
query GetGovernanceSatelliteStorageQuery {
    governance_satellite {
      address
      admin
      gov_purpose_max_length
      gov_sat_approval_percentage
      gov_sat_duration_in_days
      governance_id
      governance_satellite_counter
     
    }
    governance_satellite_action(order_by: {expiration_datetime: desc}) {
      executed
      expiration_datetime
      governance_purpose
      governance_satellite_id
      governance_type
      id
      initiator_id
      nay_vote_smvk_total
      pass_vote_smvk_total
      smvk_percentage_for_approval
      smvk_required_for_approval
      snapshot_smvk_total_supply
      start_datetime
      status
      yay_vote_smvk_total
      parameters {
        name
        value
        id
        governance_satellite_action_id
        governance_satellite_action {
          executed
          expiration_datetime
          governance_purpose
          governance_satellite_id
          governance_type
          id
          initiator_id
          nay_vote_smvk_total
          pass_vote_smvk_total
          smvk_percentage_for_approval
          smvk_required_for_approval
          snapshot_smvk_total_supply
          start_datetime
          status
          yay_vote_smvk_total
          votes {
            governance_satellite_action_id
            id
            timestamp
            vote
            voter_id
          }
        }
      }
    }
  }
`

export const GOVERNANCE_SATELLITE_STORAGE_QUERY_NAME = 'GetGovernanceSatelliteStorageQuery'
export const GOVERNANCE_SATELLITE_STORAGE_QUERY_VARIABLE = {}
