import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

export type treasuryStorageType = {
  admin: string
  config: {}

  generalContracts: MichelsonMap<MichelsonMapKey, unknown>
  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>
  whitelistTokenContracts: MichelsonMap<MichelsonMapKey, unknown>

  breakGlassConfig: {}
}
