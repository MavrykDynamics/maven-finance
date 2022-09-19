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

export const BREAK_GLASS_ACTION_QUERY_NAME = 'GetBreakGlassActionQuery'
export const BREAK_GLASS_ACTION_QUERY_VARIABLE = {}

export const BREAK_GLASS_ACTION_QUERY = `
  query GetBreakGlassActionQuery {
    break_glass_action {
    action_type
    break_glass_id
    executed
    execution_datetime
    execution_level
    expiration_datetime
    id
    initiator_id
    status
    start_datetime
    signers_count
    }
  }
`
