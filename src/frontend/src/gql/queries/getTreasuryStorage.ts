export const GET_TREASURY_DATA = `
  query getTreasuryAddresses {
    treasury {
      address,
      name
    }
  }
`

export const TREASURY_STORAGE_QUERY_NAME = 'getTreasuryAddresses'
export const TREASURY_STORAGE_QUERY_VARIABLE = {}