export const VESTING_STORAGE_QUERY = `
  query GetVestingStorageQuery {
    vesting {
      address
      default_cliff_period
      default_cooldown_period
      total_vested_amount
      vesting_claim_records_aggregate {
        aggregate {
          sum {
            amount_claimed
            remainder_vested
          }
        }
      }
    }
  }
`

export const VESTING_STORAGE_QUERY_NAME = 'GetVestingStorageQuery'
export const VESTING_STORAGE_QUERY_VARIABLE = {}
