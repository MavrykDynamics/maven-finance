export const FARM_STORAGE_QUERY = `
  query FarmStorageQuery {
    farm {
      address
      claim_paused
      deposit_paused
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
      lp_token_address
    }
  }
`

export const FARM_STORAGE_QUERY_NAME = 'FarmStorageQuery'
export const FARM_STORAGE_QUERY_VARIABLE = {}
