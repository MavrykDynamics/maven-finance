export const DELEGATION_STORAGE_QUERY = `
  query DelegationStorageQuery {
    delegation {
      address
      delegate_to_satellite_paused
      delegation_ratio
      max_satellites
      minimum_smvk_balance
      register_as_satellite_paused
      undelegate_from_satellite_paused
      unregister_as_satellite_paused
      update_satellite_record_paused
      satellite_description_max_length
      satellite_image_max_length
      satellite_name_max_length
      distribute_reward_paused
      satellite_website_max_length
      admin
      governance_id
      satellite_records(order_by: {active: desc}) {
        delegation_id
        description
        fee
        id
        image
        name
        user_id
        active
        website
        delegation_records {
          user {
            smvk_balance
          }
        }
        user {
          smvk_balance
          mvk_balance
          address
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
            voting_power
          }
          governance_proposal_records_votes(where: {governance_proposal_record: {current_round_proposal: {_eq: true}}}) {
            governance_proposal_record_id
            id
            current_round_vote
            round
            vote
            voter_id
            voting_power
            governance_proposal_record {
              abstain_mvk_total
              abstain_vote_count
              current_cycle_end_level
              current_cycle_start_level
              current_round_proposal
              cycle
              description
              down_vote_count
              down_vote_mvk_total
              executed
              execution_counter
              governance_id
              id
              invoice
              locked
              min_proposal_round_vote_pct
              min_proposal_round_vote_req
              min_quorum_mvk_total
              min_quorum_percentage
              pass_vote_count
              pass_vote_mvk_total
              payment_processed
              proposer_id
              quorum_mvk_total
              quorum_vote_count
              source_code
              start_datetime
              status
              success_reward
              title
              up_vote_count
              up_vote_mvk_total
            }
          }
        }
      }
      delegation_records {
        satellite_record_id
        delegation_id
        id
        user_id
      }
    }
  }
`

export const DELEGATION_STORAGE_QUERY_NAME = 'DelegationStorageQuery'
export const DELEGATION_STORAGE_QUERY_VARIABLE = {}
