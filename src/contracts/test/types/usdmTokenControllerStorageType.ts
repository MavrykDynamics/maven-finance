import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

export type usdmTokenControllerStorageType = {
  admin: string;
  config: {};

  whitelistTokenContracts  : MichelsonMap<MichelsonMapKey, unknown>;

  // vaults and owners
  vaults                   : MichelsonMap<MichelsonMapKey, unknown>;
  vaultCounter             : BigNumber;
  vaultLedger              : MichelsonMap<MichelsonMapKey, unknown>;
  ownerLedger              : MichelsonMap<MichelsonMapKey, unknown>;

  // price and tokens
  targetLedger             : MichelsonMap<MichelsonMapKey, unknown>;
  driftLedger              : MichelsonMap<MichelsonMapKey, unknown>;
  lastDriftUpdateLedger    : MichelsonMap<MichelsonMapKey, unknown>;
  collateralTokenLedger    : MichelsonMap<MichelsonMapKey, unknown>;
  priceLedger              : MichelsonMap<MichelsonMapKey, unknown>;

  usdmTokenAddress         : string;
  cfmmAddressLedger        : MichelsonMap<MichelsonMapKey, unknown>;

  tempValue                : BigNumber;
}
