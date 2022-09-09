export const VESTING_STORAGE_QUERY = `
  query GetVestingStorageQuery {
    vesting {
      address
      total_vested_amount
    }
  }
`

export const VESTING_STORAGE_QUERY_NAME = 'GetVestingStorageQuery'
export const VESTING_STORAGE_QUERY_VARIABLE = {}
