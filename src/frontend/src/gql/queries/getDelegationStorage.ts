export const DELEGATION_STORAGE_QUERY = `
  query DelegationStorageQuery {
    delegation {
      admin
      address
      governance_id
      delegation_ratio
      max_satellites
      minimum_smvk_balance
      delegate_to_satellite_paused
      register_as_satellite_paused
      undelegate_from_satellite_paused
      unregister_as_satellite_paused
      update_satellite_record_paused
      distribute_reward_paused
      satellite_description_max_length
      satellite_image_max_length
      satellite_name_max_length
      satellite_website_max_length
      satellites {
        delegation_id
        description
        fee
        id
        image
        name
        status
        website
        user_id
        delegations {
          user {
            smvk_balance
          }
        }
        delegation {
          delegation_ratio
        }
        user {
          smvk_balance
          mvk_balance
          aggregator_oracles {
            aggregator_id
            id
            last_updated_at
            aggregator {
              address
            }
          }
          emergency_governance_votes {
            emergency_governance_record_id
            id
            smvk_amount
            timestamp
            voter_id
            emergency_governance_record {
              title
            }
          }
          governance_financial_requests_votes {
            governance_financial_request_id
            id
            timestamp
            vote
            voter_id
            governance_financial_request {
              request_type
            }
          }
          governance_proposals_votes {
            governance_proposal_id
            id
            round
            timestamp
            vote
            voter_id
            voting_power
            current_round_vote
            governance_proposal {
              title
            }
          }
          governance_satellite_actions_votes {
            governance_satellite_action_id
            id
            timestamp
            vote
            voter_id
            governance_satellite_action {
              governance_type
            }
          }
        }
      }
      delegations {
        satellite_id
        delegation_id
        id
      }
    }
  }
`

export const DELEGATION_STORAGE_QUERY_NAME = 'DelegationStorageQuery'
export const DELEGATION_STORAGE_QUERY_VARIABLE = {}
