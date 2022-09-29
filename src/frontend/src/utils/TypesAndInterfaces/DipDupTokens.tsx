import { Dipdup_Token_Metadata } from 'utils/generated/graphqlTypes'

export type DipDupTokensGraphQl = Omit<Dipdup_Token_Metadata, '__typename'> & {
  metadata: {
    icon: string
    name: string
    symbol: string
    decimals: string
    thumbnailUri: string
    shouldPreferSymbol: string
  }
}
