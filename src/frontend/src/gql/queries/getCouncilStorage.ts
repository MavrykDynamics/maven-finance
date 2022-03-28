export const COUNCIL_STORAGE_QUERY = `
  query GetCouncilStorageQuery {
    council {
      action_counter
      action_expiry_days
      address
      threshold
      council_members {
        address
      }
      council_action_records {
        action_type
        executed
        council_id
        executed_datetime
        expiration_datetime
        id
        initiator_id
        start_datetime
        status
      }
    }
  }
`

export const COUNCIL_STORAGE_QUERY_NAME = 'GetCouncilStorageQuery'
export const COUNCIL_STORAGE_QUERY_VARIABLE = {}
