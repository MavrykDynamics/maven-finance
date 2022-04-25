export const SATELLITE_RECORDS_QUERY = `
  query GetSatelliteRecord($_eq: String = "") {
    satellite_record(where: {user_id: {_eq: $_eq}}) {
      delegation_id
      fee
      image
      name
      description
      active
      user_id
      registered_datetime
      unregistered_datetime
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
  }
`

export const SATELLITE_RECORDS_QUERY_NAME = 'GetSatelliteRecord'
export function SATELLITE_RECORDS_QUERY_VARIABLES(address: string): Record<string, any> {
  /* prettier-ignore */
  return { _eq: address }
}
