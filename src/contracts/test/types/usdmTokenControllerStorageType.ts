import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

export type usdmTokenControllerStorageType = {
  admin: string;
  config: {};

  whitelistTokenContracts  : MichelsonMap<MichelsonMapKey, unknown>;
  vaults                   : MichelsonMap<MichelsonMapKey, unknown>;

  targetLedger             : MichelsonMap<MichelsonMapKey, unknown>;
  driftLedger              : MichelsonMap<MichelsonMapKey, unknown>;
  lastDriftUpdateLedger    : MichelsonMap<MichelsonMapKey, unknown>;
  collateralTokenLedger    : MichelsonMap<MichelsonMapKey, unknown>;
  priceLedger              : MichelsonMap<MichelsonMapKey, unknown>;

  usdmTokenAddress         : string;
  cfmmAddressLedger        : MichelsonMap<MichelsonMapKey, unknown>;
}
