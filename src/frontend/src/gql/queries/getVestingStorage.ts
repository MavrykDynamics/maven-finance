export const VESTING_STORAGE_QUERY = `
  query GetVestingStorageQuery {
    vesting {
      address
      admin
      governance_id
      total_vested_amount
      vestees_aggregate {
        aggregate {
          sum {
            total_claimed
            total_remainder
          }
        }
      }
    }
  
  }
`

export const VESTING_STORAGE_QUERY_NAME = 'GetVestingStorageQuery'
export const VESTING_STORAGE_QUERY_VARIABLE = {}
