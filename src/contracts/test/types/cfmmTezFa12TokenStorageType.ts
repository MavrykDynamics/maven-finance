import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

export type cfmmTezFa12TokenStorageType = {

  admin : string
  config: {}

  cashPool: BigNumber

  tokenName : string
  tokenAddress : string
  tokenPool: BigNumber

  lpTokenAddress: string
  lpTokensTotal : BigNumber
  pendingPoolUpdates: BigNumber

  lastOracleUpdate : Date
  usdmTokenAddress : string
  treasuryAddress : string
}
