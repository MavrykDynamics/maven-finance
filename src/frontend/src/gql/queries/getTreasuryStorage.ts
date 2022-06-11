export const GET_TREASURY_ADDRESSES = `
  query getTreasuryAddresses {
    treasury {
      address
    }
  }
`

export const TREASURY_STORAGE_QUERY_NAME = 'getTreasuryAddresses'
export const TREASURY_STORAGE_QUERY_VARIABLE = {}