export const BREAK_GLASS_STORAGE_QUERY = `
  query GetBreakGlassStorageQuery {
    break_glass {
      action_counter
      action_expiry_days
      address
      glass_broken
      threshold
      break_glass_action_records {
        action_type
        break_glass_id
        executed
        executed_datetime
        expiration_datetime
        id
        initiator_id
        start_datetime
        status
        signers {
          signer_id
          id
          break_glass_action_record_id
        }
        executed_level
        signers_count
      }
      council_member_image_max_length
      council_member_name_max_length
      council_member_website_max_length
      admin
      governance_id
    }
  }
`

export const BREAK_GLASS_STORAGE_QUERY_NAME = 'GetBreakGlassStorageQuery'
export const BREAK_GLASS_STORAGE_QUERY_VARIABLE = {}
