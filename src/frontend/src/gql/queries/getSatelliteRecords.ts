export const SATELLITE_RECORDS_QUERY = `
  query GetSatelliteRecord($_eq: String = "") {
    satellite_record(where: {user_id: {_eq: $_eq}}) {
      delegation_id
      fee
      image
      name
      description
      user_id
      delegation_records {
        user {
          smvk_balance
        }
        satellite_record_id
      }
      user {
        mvk_balance
        address
      }
      active
      website
    }
  }  
`

export const SATELLITE_RECORDS_QUERY_NAME = 'GetSatelliteRecord'

export function SATELLITE_RECORDS_QUERY_VARIABLES(address: string): Record<string, any> {
  /* prettier-ignore */
  return { _eq: address }
}


export const USER_VOTING_HYSTORY_QUERY = `
  query UserVotingHistory($_eq: String = "") {
    mavryk_user(where: {address: {_eq: $_eq}}) {
      participation_fees_per_share
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
        voting_power
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
`

export const USER_VOTING_HYSTORY_NAME = 'UserVotingHistory'

export function USER_VOTING_HYSTORY_VARIABLES(address: string): Record<string, any> {
  /* prettier-ignore */
  return { _eq: address }
}
