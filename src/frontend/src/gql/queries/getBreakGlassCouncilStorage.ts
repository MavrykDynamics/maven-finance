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

const curentDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`

export const PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY = `
  query GetPastBreakGlassCouncilActions($_lt: timestamptz = "${curentDate}") {
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

export const BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE_QUERY_NAME = 'GetBreakGlassActionsPendingMySignature'
export const BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE_QUERY_VARIABLE = {}

export const BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE_QUERY = `
  query GetBreakGlassActionsPendingMySignature($_gte: timestamptz = "${curentDate}", $userAddress: String = "", $userAddress2: String = "") {
    break_glass_action(where: {expiration_datetime: {_gte: $_gte}, initiator_id: {_neq: $userAddress}, signers: { signer_id: {_neq: $userAddress2}}}) {
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
