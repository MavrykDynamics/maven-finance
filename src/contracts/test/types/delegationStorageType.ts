import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'

export type delegationStorageType = {
  
  admin               : string
  mvkTokenAddress     : string;
  metadata            : MichelsonMap<MichelsonMapKey, unknown>;

  config              : {}
  breakGlassConfig    : {}

  whitelistContracts  : MichelsonMap<MichelsonMapKey, unknown>
  generalContracts    : MichelsonMap<MichelsonMapKey, unknown>

  delegateLedger      : MichelsonMap<MichelsonMapKey, unknown>
  satelliteLedger     : MichelsonMap<MichelsonMapKey, unknown>

  lambdaLedger        : MichelsonMap<MichelsonMapKey, unknown>
  
}
