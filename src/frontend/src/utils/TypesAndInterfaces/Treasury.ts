// type
import type { Treasury, Treasury_Factory } from '../generated/graphqlTypes'
export type TreasuryGraphQL = Omit<Treasury, '__typename'>
export type TreasuryFactoryGraphQL = Omit<Treasury_Factory, '__typename'>

export type TreasuryGQLType = {
  address: string
  name: string
}

export type TreasuryType = TreasuryGQLType & FetchedTreasuryType

export type FetchedTreasuryType = {
  balances: Array<TreasuryBalanceType>
  total: number
}

export type TreasuryBalanceType = {
  rate: number
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

export type TreasuryChartType = Array<ChartSectorType>

export type ChartSectorType = {
  title: string
  value: number
  color: string
  labelPersent: number
  segmentStroke: number
  groupedSmall: boolean
}
