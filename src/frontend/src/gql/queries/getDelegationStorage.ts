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
      satellite_records {
        delegation_id
        description
        fee
        id
        image
        name
        status
        website
        user_id
        delegation_records {
          user {
            smvk_balance
          }
        }
        user {
          smvk_balance
          mvk_balance
          aggregator_oracle_records {
            active
            aggregator_id
            id
            oracle_id
          }
          emergency_governance_votes {
            emergency_governance_record_id
            id
            smvk_amount
            timestamp
            voter_id
          }
          governance_financial_requests_votes {
            governance_financial_request_id
            id
            timestamp
            vote
            voter_id
          }
          governance_proposal_records_votes {
            governance_proposal_record_id
            id
            round
            vote
            voter_id
            voting_power
            current_round_vote
          }
          governance_satellite_snapshot_records_votes {
            cycle
            governance_id
            id
            total_delegated_amount
            total_smvk_balance
            total_voting_power
            user_id
          }
          governance_satellite_actions_votes {
            governance_satellite_action_id
            id
            timestamp
            vote
            voter_id
          }
        }
      }
      delegation_records {
        satellite_record_id
        delegation_id
        id
      }
    }
  }
`;

export const DELEGATION_STORAGE_QUERY_NAME = "DelegationStorageQuery";
export const DELEGATION_STORAGE_QUERY_VARIABLE = {};
