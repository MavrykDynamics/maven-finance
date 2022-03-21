import { MichelsonMap } from '@taquito/taquito'

export interface MvkTokenStorage {
  admin?: string
  tokenId?: number
  contractAddresses?: MichelsonMap<string, string>
  whitelistContracts?: MichelsonMap<string, string>
  totalSupply: number
  maximumTotalSupply: number
}
