export const FARM_STORAGE_QUERY = `
query FarmStorageQuery {
  farm {
    address
    claim_paused
    deposit_paused
    farm_factory_id
    infinite
    init_block
    last_block_update
    open
    total_blocks
    withdraw_paused
    accumulated_rewards_per_share
    current_reward_per_block
    init
    lp_token_address
    lp_token_balance
    lp_token_id
    lp_token_standard
    paid_rewards
    total_rewards
    unpaid_rewards
    force_rewards_from_transfer
    name
    creation_timestamp
    admin
    min_block_time_snapshot
    governance_id
    farm_accounts {
      claimed_rewards
      deposited_amount
      farm_id
      id
      unclaimed_rewards
      user_id
      participation_rewards_per_share
    }
  }
  farm_factory {
    address
    create_farm_paused
    track_farm_paused
    untrack_farm_paused
    admin
    farm_name_max_length
    farms {
      withdraw_paused
      total_blocks
      open
      last_block_update
      init_block
      farm_factory_id
      infinite
      deposit_paused
      claim_paused
      address
      total_rewards
      unpaid_rewards
      paid_rewards
      lp_token_standard
      lp_token_id
      lp_token_balance
      lp_token_address
      init
      force_rewards_from_transfer
      current_reward_per_block
      accumulated_rewards_per_share
      creation_timestamp
      admin
      name
    }
  }
}

`

export const FARM_STORAGE_QUERY_NAME = 'FarmStorageQuery'
export const FARM_STORAGE_QUERY_VARIABLE = {}
