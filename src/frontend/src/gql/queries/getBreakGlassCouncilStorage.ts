export const BREAK_GLASS_COUNCIL_MEMBER_QUERY_NAME = 'GetBreakGlassCouncilMemberQuery'
export const BREAK_GLASS_COUNCIL_MEMBER_QUERY_VARIABLE = {}

export const BREAK_GLASS_COUNCIL_MEMBER_QUERY = `
  query GetBreakGlassCouncilMemberQuery {
    break_glass_council_member {
      user_id
      name
      break_glass_id
      website
      id
    }
  }
`

export const PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_NAME = 'GetPastBreakGlassCouncilActions'
export const PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_VARIABLE = {}

export const PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY = `
  query GetPastBreakGlassCouncilActions($_lt: timestamptz = "") {
    break_glass_action(where: {expiration_datetime: {_lt: $_lt}, _or: {executed: {_eq: true}}}) {
      action_type
      break_glass_id
      executed
      execution_datetime
      execution_level
      expiration_datetime
      id
      initiator_id
      signers_count
      status
      start_datetime
      signers {
        signer_id
        id
        break_glass_action_id
      }
    }
  }
`
