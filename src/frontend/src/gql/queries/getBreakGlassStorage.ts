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

export const BREAK_GLASS_STATUS_QUERY = `
  query GetBreakGlassStatusQuery {
    farm {
      address
      claim_paused
      deposit_paused
      withdraw_paused
    }
    farm_factory {
      create_farm_paused
      track_farm_paused
      untrack_farm_paused
      address
    }
    delegation {
      delegate_to_satellite_paused
      distribute_reward_paused
      register_as_satellite_paused
      undelegate_from_satellite_paused
      unregister_as_satellite_paused
      update_satellite_record_paused
      address
    }
    doorman {
      address
      compound_paused
      farm_claimed_paused
      unstake_paused
    }
    treasury {
      mint_mvk_and_transfer_paused
      stake_mvk_paused
      transfer_paused
      address
      unstake_mvk_paused
    }
  }
`

export const BREAK_GLASS_STATUS_QUERY_NAME = 'GetBreakGlassStatusQuery'
export const BREAK_GLASS_STATUS_QUERY_VARIABLE = {}

