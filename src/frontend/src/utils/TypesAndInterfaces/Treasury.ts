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

export type FetchedTreasuryBalanceType = {
  balance: string
  firstLevel: number
  firstTime: string
  id: number
  lastLevel: number
  lastTime: string
  token: {
    contract: { address: string }
    id: number
    metadata: {
      decimals: string
      icon: string
      name: string
      shouldPreferSymbol: string
      symbol: string
      thumbnailUri: string
    }
    standard: string
    tokenId: string
  }
}

export type TreasuryBalanceType = {
  rate: number
  balance: number
  usdValue: number
  contract: string
  decimals: number
  name: string
  symbol: string
  thumbnail_uri: string
  usdValue: number
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
