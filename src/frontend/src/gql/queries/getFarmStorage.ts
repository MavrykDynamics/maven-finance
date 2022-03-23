export const FARM_STORAGE_QUERY = `
  query FarmStorageQuery {
    farm {
      address
      accumulated_mvk_per_share
      blocks_per_minute
      claim_paused
      deposit_paused
      farm_factory_id
      infinite
      init_block
      last_block_update
      lp_balance
      lp_token
      open
      reward_per_block
      rewards_from_treasury
      total_blocks
      withdraw_paused
    }
    farm_factory {
      address
      create_farm_paused
      track_farm_paused
      untrack_farm_paused
      farms {
        withdraw_paused
        total_blocks
        rewards_from_treasury
        reward_per_block
        open
        lp_token
        lp_balance
        last_block_update
        init_block
        farm_factory_id
        infinite
        deposit_paused
        claim_paused
        blocks_per_minute
        address
        accumulated_mvk_per_share
      }
    }
  }
`

export const FARM_STORAGE_QUERY_NAME = 'FarmStorageQuery'
export const FARM_STORAGE_QUERY_VARIABLE = {}
