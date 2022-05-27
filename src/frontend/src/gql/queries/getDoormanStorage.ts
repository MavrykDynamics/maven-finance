export const DOORMAN_STORAGE_QUERY = `
  query DoormanStorageQuery {
    doorman {
      address
      unclaimed_rewards
      min_mvk_amount
      accumulated_fees_per_share
      farm_claimed_paused
      compound_paused
      unstake_paused
      stake_paused
      stake_accounts_aggregate {
        aggregate {
          sum {
            smvk_balance
          }
        }
      }
    }
  }
`

export const DOORMAN_STORAGE_QUERY_NAME = 'DoormanStorageQuery'
export const DOORMAN_STORAGE_QUERY_VARIABLE = {}
