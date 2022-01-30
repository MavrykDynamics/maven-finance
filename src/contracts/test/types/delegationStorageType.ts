import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'

export type delegationStorageType = {
  admin: string
  config: {}
  breakGlassConfig: {}

  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>
  generalContracts: MichelsonMap<MichelsonMapKey, unknown>

  delegateLedger: MichelsonMap<MichelsonMapKey, unknown>
  satelliteLedger: MichelsonMap<MichelsonMapKey, unknown>
}
