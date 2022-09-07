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
        execution_datetime
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
        execution_level
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
      name
      address
      claim_paused
      deposit_paused
      withdraw_paused
      admin
    }
    farm_factory {
      create_farm_paused
      track_farm_paused
      untrack_farm_paused
      address
      admin
    }
    delegation {
      delegate_to_satellite_paused
      distribute_reward_paused
      register_as_satellite_paused
      undelegate_from_satellite_paused
      unregister_as_satellite_paused
      update_satellite_record_paused
      address
      admin
    }
    doorman {
      address
      compound_paused
      farm_claimed_paused
      unstake_paused
      admin
    }
    treasury {
      name
      mint_mvk_and_transfer_paused
      stake_mvk_paused
      transfer_paused
      address
      unstake_mvk_paused
      admin
    }
    treasury_factory {
      create_treasury_paused
      address
      track_treasury_paused
      untrack_treasury_paused
      admin
    }
    aggregator {
      address
      name
      request_rate_update_deviation_paused
      request_rate_update_paused
      set_observation_commit_paused
      set_observation_reveal_paused
      withdraw_reward_smvk_paused
      withdraw_reward_xtz_paused
      admin
    }
    aggregator_factory {
      address
      untrack_aggregator_paused
      track_aggregator_paused
      distribute_reward_xtz_paused
      distribute_reward_smvk_paused
      create_aggregator_paused
      admin
    }
  }
`

export const BREAK_GLASS_STATUS_QUERY_NAME = 'GetBreakGlassStatusQuery'
export const BREAK_GLASS_STATUS_QUERY_VARIABLE = {}

export const WHITELIST_DEV_QUERY = `
query GetWhitelistDevQuery {
  whitelist_developer {
    developer {
      address
    }
  }
}
`
export const WHITELIST_DEV_QUERY_NAME = 'GetWhitelistDevQuery'
export const WHITELIST_DEV_QUERY_VARIABLE = {}
