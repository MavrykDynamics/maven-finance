

export type TreasuryType =  {
  address: string,
  name: string
} & FetchedTreasuryType

export type FetchedTreasuryType = {
  balances: Array<TreasuryBalanceType>,
  total: number
}

export type TreasuryBalanceType = {
  balance: number
  contract: string
  decimals: number
  is_transferable: boolean
  name: string
  network: string
  symbol: string
  thumbnail_uri: string
  tokenColor: string
  token_id: number
}

export type TreasuryChartType = Array<ChartSectorType>

export type ChartSectorType = {
  title: string
  value: number
  color: string
  labelPersent: number
  segmentStroke: number
  groupedSmall: boolean
}