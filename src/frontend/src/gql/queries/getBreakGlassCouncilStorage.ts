import { parseData,  } from "utils/time"

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

const time = String(new Date())
const timeFormat = 'YYYY-MM-DD'
const curentDate = parseData({ time, timeFormat })

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
// TODO: add curent data and address
export const BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE_QUERY = `
  query GetBreakGlassActionsPendingMySignature($_gte: timestamptz = "2022-09-01", $userAddress: String = "", $userAddress2: String = "") {
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

export const MY_PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_NAME = 'GetMyPastBreakGlassCouncilActions'
export const MY_PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_VARIABLE = {}
// TODO: add address
export const MY_PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY = `
  query GetMyPastBreakGlassCouncilActions($_lt: timestamptz = "${curentDate}", $userAddress: String = "") {
    break_glass_action(where: {expiration_datetime: {_lte: $_lt}, _or: {executed: {_eq: true}, _and: {initiator_id: {_eq: $userAddress}}}}) {
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
