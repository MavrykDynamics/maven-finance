import type {Mvk_Token} from '../generated/graphqlTypes'
import { MichelsonMap } from '@taquito/taquito'

export interface MvkTokenStorage {
  admin?: string
  tokenId?: number
  contractAddresses?: MichelsonMap<string, string>
  whitelistContracts?: MichelsonMap<string, string>
  totalSupply: number
  maximumTotalSupply: number
}

export type MvkTokenGraphQL = Omit<Mvk_Token, '__typename'>
