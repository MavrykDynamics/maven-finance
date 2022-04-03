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
    satellite_records(order_by: {active: desc}) {
      delegation_id
      description
      fee
      id
      image
      name
      registered_datetime
      unregistered_datetime
      user_id
      active
      delegation_records {
        user {
          smvk_balance
        }
      }
      user {
        smvk_balance
        mvk_balance
      }
      governance_financial_requests_votes {
        governance_financial_request_id
        id
        timestamp
        vote
        voter_id
        voting_power
        governance_financial_request {
          approve_vote_total
          disapprove_vote_total
          executed
          expiration_datetime
          governance_id
          id
          ready
          request_purpose
          requested_datetime
          request_type
          requester_id
          smvk_percentage_for_approval
          smvk_required_for_approval
          snapshot_smvk_total_supply
          status
          token_amount
          token_contract_address
          token_id
          token_name
          treasury_id
        }
      }
      governance_proposal_records_votes {
        current_round_vote
        governance_proposal_record_id
        id
        round
        vote
        timestamp
        voter_id
        voting_power
        governance_proposal_record {
          abstain_mvk_total
          current_cycle_end_level
          current_cycle_start_level
          cycle
          current_round_proposal
          description
          down_vote_mvk_total
          executed
          id
          invoice
          locked
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
`

export const DELEGATION_STORAGE_QUERY_NAME = 'DelegationStorageQuery'
export const DELEGATION_STORAGE_QUERY_VARIABLE = {}
