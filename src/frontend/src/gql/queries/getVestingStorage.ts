export const VESTING_STORAGE_QUERY = `
  query GetVestingStorageQuery {
    vesting {
      address
      total_vested_amount
      vesting_vestee_records_aggregate {
        aggregate {
          sum {
            total_claimed
            total_remainder
            total_allocated_amount
            claim_amount_per_month
          }
        }
      }
    }
  }
`

export const VESTING_STORAGE_QUERY_NAME = 'GetVestingStorageQuery'
export const VESTING_STORAGE_QUERY_VARIABLE = {}
