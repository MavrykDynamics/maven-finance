

export type TreasuryType =  {
  address: string,
  name: string
} & FetchedTreasuryType

export type FetchedTreasuryType = {
  balances: Array<TreasuryBalanceType>,
  total: number
}

// export type TreasuryBalanceType = Record<string, unknown>
export type TreasuryBalanceType = {
  balance: number
  contract: string
  decimals: number
  is_transferable: boolean
  name: string
  network: string
  symbol: string
  thumbnail_uri: string
  token_id: number
}