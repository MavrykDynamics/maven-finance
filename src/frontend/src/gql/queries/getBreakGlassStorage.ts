export const BREAK_GLASS_STORAGE_QUERY = `
  query GetBreakGlassQuery {
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
      }
      council_members {
        break_glass_id
        address
      }
    }
  }
`

export const BREAK_GLASS_STORAGE_QUERY_NAME = 'GetBreakGlassQuery'
export const BREAK_GLASS_STORAGE_QUERY_VARIABLE = {}
