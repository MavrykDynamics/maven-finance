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
export function PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_VARIABLE(variables: { _lt?: string }) {
  return variables
}

const BREAK_GLASS_ACTION_PARAMS = `
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
`

export const PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY = `
  query GetPastBreakGlassCouncilActions($_lt: timestamptz = "") {
    break_glass_action(where: {expiration_datetime: {_lt: $_lt}, _or: {executed: {_eq: true}}}) {
     ${BREAK_GLASS_ACTION_PARAMS}
    }
  }
`

export const BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE_QUERY_NAME = 'GetBreakGlassActionsPendingMySignature'
export function BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE_QUERY_VARIABLE(variables: {
  _gte?: string
  userAddress?: string
  userAddress2?: string
}) {
  return variables
}

export const BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE_QUERY = `
  query GetBreakGlassActionsPendingMySignature($_gte: timestamptz = "", $userAddress: String = "", $userAddress2: String = "") {
    break_glass_action(where: {expiration_datetime: {_gte: $_gte}, initiator_id: {_neq: $userAddress}, signers: { signer_id: {_neq: $userAddress2}}}) {
      ${BREAK_GLASS_ACTION_PARAMS}
      parameters {
        id
        name
        value
      }
    }
  }
`

export const MY_PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_NAME = 'GetMyPastBreakGlassCouncilActions'
export function MY_PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_VARIABLE(variables: { _lt?: string; userAddress?: string }) {
  return variables
}

export const MY_PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY = `
  query GetMyPastBreakGlassCouncilActions($_lt: timestamptz = "", $userAddress: String = "") {
    break_glass_action(where: {expiration_datetime: {_lte: $_lt}, _or: {executed: {_eq: true}, _and: {initiator_id: {_eq: $userAddress}}}}) {
      ${BREAK_GLASS_ACTION_PARAMS}
    }
  }
`
