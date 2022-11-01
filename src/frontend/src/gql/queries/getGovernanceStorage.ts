export const GOVERNANCE_STORAGE_QUERY = `
query GetGovernanceStorageQuery {
    governance(where: {active: {_eq: true}}) {
      address
      blocks_per_proposal_round
      blocks_per_timelock_round
      blocks_per_voting_round
      current_cycle_end_level
      current_round
      current_round_end_level
      current_round_start_level
      next_proposal_id
      proposal_round_vote_percentage
      proposal_round_vote_required
      success_reward
      current_blocks_per_proposal_round
      current_blocks_per_timelock_round
      current_blocks_per_voting_round
      current_cycle_total_voters_reward
      cycle_voters_reward
      governance_proxy_address
      proposal_invoice_max_length
      proposal_metadata_title_max_length
      proposal_description_max_length
      proposal_source_code_max_length
      proposal_submission_fee_mutez
      proposal_title_max_length
      timelock_proposal_id
      cycle_highest_voted_proposal_id
      active
      max_proposal_per_satellite
      min_quorum_percentage
      min_yay_vote_percentage
    }
    governance_financial_request {
      executed
      expiration_datetime
      execution_datetime
      id
      request_purpose
      request_type
      requested_datetime
      smvk_percentage_for_approval
      requester_id
      smvk_required_for_approval
      snapshot_smvk_total_supply
      status
      token_amount
      token_address
      treasury_id
      governance_financial_id
      pass_vote_smvk_total
      nay_vote_smvk_total
      yay_vote_smvk_total
      votes {
        governance_financial_request_id
        id
        timestamp
        vote
        voter_id
      }
      governance_financial {
        governance {
          address
        }
      }
    }
    governance_proposal {
      current_cycle_end_level
      current_cycle_start_level
      current_round_proposal
      cycle
      description
      id
      executed
      invoice
      locked
      min_proposal_round_vote_pct
      min_quorum_percentage
      min_proposal_round_vote_req
      proposer_id
      source_code
      start_datetime
      status
      success_reward
      title
      quorum_count
      nay_vote_count
      nay_vote_smvk_total
      pass_vote_smvk_total
      quorum_smvk_total
      proposal_vote_smvk_total
      proposal_vote_count
      yay_vote_count
      yay_vote_smvk_total
      execution_counter
      governance_id
      payment_processed
      pass_vote_count
      min_yay_vote_percentage
      votes {
        current_round_vote
        governance_proposal_id
        governance_proposal {
          executed
          locked
        }
        id
        round
        vote
        voter_id
      }
      data {
        encoded_code
        governance_proposal_id
        code_description
        id
        title
      }
      payments {
        governance_proposal_id
        id
        internal_id
        title
        to__id
        token_amount
        token_address
      }
    }
  }
`

export const GOVERNANCE_STORAGE_QUERY_NAME = 'GetGovernanceStorageQuery'
export const GOVERNANCE_STORAGE_QUERY_VARIABLE = {}

export const CURRENT_ROUND_PROPOSALS_QUERY = `
query GetCurrentRoundProposalsQuery {
  governance_proposal(where: {current_round_proposal: {_eq: true}, _and: {status: {_eq: "0"}}}) {
      current_cycle_end_level
      current_cycle_start_level
      current_round_proposal
      cycle
      description
      id
      executed
      invoice
      locked
      min_proposal_round_vote_pct
      min_quorum_percentage
      min_proposal_round_vote_req
      proposer_id
      source_code
      start_datetime
      status
      success_reward
      title
      quorum_count
      nay_vote_count
      nay_vote_smvk_total
      pass_vote_smvk_total
      quorum_smvk_total
      proposal_vote_smvk_total
      proposal_vote_count
      yay_vote_count
      yay_vote_smvk_total
      execution_counter
      governance_id
      payment_processed
      pass_vote_count
      min_yay_vote_percentage
      votes {
        current_round_vote
        governance_proposal_id
        id
        round
        vote
        voter_id
        governance_proposal {
          executed
          locked
        }
      }
      data {
        encoded_code
        governance_proposal_id
        code_description
        id
        title
      }
      payments {
        governance_proposal_id
        id
        internal_id
        title
        to__id
        token_amount
        token_address
      }
    }
  }
`

export const CURRENT_ROUND_PROPOSALS_QUERY_NAME = 'GetCurrentRoundProposalsQuery'
export const CURRENT_ROUND_PROPOSALS_QUERY_VARIABLE = {}
