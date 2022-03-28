export const GOVERNANCE_STORAGE_QUERY = `
  query GetGovernanceStorageQuery {
    governance {
      address
      blocks_per_minute
      blocks_per_proposal_round
      blocks_per_timelock_round
      blocks_per_voting_round
      current_cycle_end_level
      current_round
      current_round_end_level
      current_round_start_level
      financial_req_approval_percent
      financial_req_duration_in_days
      max_proposal_per_delegate
      min_quorum_mvk_total
      min_quorum_percentage
      minimum_stake_req_percentage
      new_block_per_minute
      new_blocktime_level
      next_proposal_id
      proposal_round_vote_percentage
      proposal_round_vote_required
      proposal_submission_fee
      start_level
      voting_power_ratio
      success_reward
    }
    governance_financial_request_record {
      approve_vote_total
      executed
      disapprove_vote_total
      expiration_datetime
      governance_id
      id
      ready
      request_purpose
      request_type
      requested_datetime
      smvk_percentage_for_approval
      requester_id
      smvk_required_for_approval
      snapshot_smvk_total_supply
      status
      token_amount
      token_contract_address
      token_id
      token_name
      treasury_id
      votes {
        governance_financial_request_id
        id
        timestamp
        vote
        voter_id
        voting_power
      }
    }
    governance_proposal_record {
      abstain_mvk_total
      current_cycle_end_level
      current_cycle_start_level
      current_round_proposal
      cycle
      description
      down_vote_mvk_total
      id
      executed
      invoice
      locked
      min_proposal_round_vote_pct
      pass_vote_mvk_total
      min_quorum_percentage
      min_quorum_mvk_total
      min_proposal_round_vote_req
      proposer_id
      quorum_mvk_total
      source_code
      round_highest_voted_proposal
      start_datetime
      status
      success_reward
      timelock_proposal
      title
      up_vote_mvk_total
      votes {
        current_round_vote
        governance_proposal_record_id
        id
        round
        timestamp
        vote
        voter_id
        voting_power
      }
    }
    governance_proposal_record_metadata {
      governance_proposal_record_id
      id
      metadata
      name
    }
    governance_satellite_snapshot_record {
      current_cycle_end_level
      current_cycle_start_level
      satellite_id
      total_delegated_amount
      total_mvk_balance
      total_voting_power
      id
      governance_id
    }
  }
`

export const GOVERNANCE_STORAGE_QUERY_NAME = 'GetGovernanceStorageQuery'
export const GOVERNANCE_STORAGE_QUERY_VARIABLE = {}
