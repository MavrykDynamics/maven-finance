export const SATELLITE_RECORDS_QUERY = `
  query GetSatelliteRecord($_eq: String = "") {
    satellite_record(where: {user_id: {_eq: $_eq}}) {
      delegation_id
      description
      fee
      id
      image
      name
      user_id
      status
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
          current_round_vote
          round
          vote
          voter_id
          governance_proposal_record {
            current_cycle_end_level
            current_cycle_start_level
            current_round_proposal
            cycle
            description
            executed
            execution_counter
            governance_id
            id
            invoice
            locked
            min_proposal_round_vote_pct
            min_proposal_round_vote_req
            min_quorum_percentage
            pass_vote_count
            payment_processed
            proposer_id
            source_code
            start_datetime
            status
            success_reward
            title
            quorum_count
            min_yay_vote_percentage
            nay_vote_count
            nay_vote_smvk_total
            pass_vote_smvk_total
            proposal_vote_smvk_total
            proposal_vote_count
            quorum_smvk_total
            yay_vote_count
            yay_vote_smvk_total
          }
        }
      }
    }
  }
`;

export const SATELLITE_RECORDS_QUERY_NAME = "GetSatelliteRecord";

export function SATELLITE_RECORDS_QUERY_VARIABLES(
  address: string
): Record<string, any> {
  /* prettier-ignore */
  return { _eq: address }
}

export const USER_VOTING_HYSTORY_QUERY = `
  query UserVotingHistory($_eq: String = "") {
    mavryk_user(where: {address: {_eq: $_eq}}) {
      smvk_balance
      mvk_balance
      address
      emergency_governance_votes {
        emergency_governance_record_id
        id
        smvk_amount
        voter_id
        timestamp
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
        current_round_vote
        round
        id
        vote
        voter_id
        voting_power
      }
    }
  }
`;

export const USER_VOTING_HYSTORY_NAME = "UserVotingHistory";

export function USER_VOTING_HYSTORY_VARIABLES(
  address: string
): Record<string, any> {
  /* prettier-ignore */
  return { _eq: address }
}
