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
