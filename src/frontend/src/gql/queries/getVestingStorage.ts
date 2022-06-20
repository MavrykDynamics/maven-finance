export const VESTING_STORAGE_QUERY = `
  query GetVestingStorageQuery {
    vesting {
      address
      total_vested_amount
    }
  }
`

export const VESTING_STORAGE_QUERY_OLD = `
  query GetVestingStorageQuery {
    vesting {
      address
      total_vested_amount
      vesting_claim_records_aggregate {
        aggregate {
          sum {
            amount_claimed
            remainder_vested
            id
          }
        }
      }
    }
  }
`


export const VESTING_STORAGE_QUERY_NAME = 'GetVestingStorageQuery'
export const VESTING_STORAGE_QUERY_VARIABLE = {}
