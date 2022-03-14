export const DOORMAN_STORAGE_QUERY = `
  query DoormanStorageQuery {
    doorman {
      address
      unclaimed_rewards
      min_mvk_amount
      smvk_total_supply
      compound_paused
      unstake_paused
      stake_paused
      accumulated_fees_per_share
    }
  }
`

export const DOORMAN_STORAGE_QUERY_NAME = 'DoormanStorageQuery'
export const DOORMAN_STORAGE_QUERY_VARIABLE = {}
