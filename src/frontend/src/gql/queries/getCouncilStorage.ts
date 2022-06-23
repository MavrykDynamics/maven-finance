export const COUNCIL_STORAGE_QUERY = `
  query GetCouncilStorageQuery {
    council {
      action_counter
      action_expiry_days
      address
      admin
      council_member_image_max_length
      council_member_name_max_length
      governance_id
      request_purpose_max_length
      request_token_name_max_length
      threshold
      council_action_records {
        action_type
        council_id
        executed
        executed_datetime
        executed_level
        expiration_datetime
        id
        status
        start_datetime
        signers_count
        initiator_id
        signers {
          id
          signer_id
        }
      }
      council_member_website_max_length
      council_council_members {
        id
        name
        image
        user_id
        website
      }
    }
  }
`
export const COUNCIL_STORAGE_QUERY_NAME = 'GetCouncilStorageQuery'
export const COUNCIL_STORAGE_QUERY_VARIABLE = {}

const COUNCIL_ACTIONS_PARAMS = `
  council_id
  executed
  executed_datetime
  executed_level
  expiration_datetime
  id
  initiator_id
  signers_count
  start_datetime
  status
  action_type
`

export const COUNCIL_PAST_ACTIONS_QUERY = `
  query GetPastCouncilActions {
    council_action_record(where: {executed: {_eq: true}}) {
      ${COUNCIL_ACTIONS_PARAMS}
    }
  }
`
export const COUNCIL_PAST_ACTIONS_NAME = 'GetPastCouncilActions'
export const COUNCIL_PAST_ACTIONS_VARIABLE = {}


// TODO May be “initiator_id” === “accountPkh”
export const COUNCIL_PENDING_ACTIONS_QUERY = `
  query GetPandingCouncilActions {
    council_action_record(where: {status: {_eq: "0"}}, order_by: {executed_datetime: asc}, limit: 3) {
      ${COUNCIL_ACTIONS_PARAMS}
    }
  }
`
export const COUNCIL_PENDING_ACTIONS_NAME = 'GetPandingCouncilActions'
export const COUNCIL_PENDING_ACTIONS_VARIABLE = {}


