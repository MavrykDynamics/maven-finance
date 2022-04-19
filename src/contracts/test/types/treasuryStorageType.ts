import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

export type treasuryStorageType = {
  admin                     : string;
  mvkTokenAddress           : string;
  metadata                  : MichelsonMap<MichelsonMapKey, unknown>;

  config                    : {};
  breakGlassConfig          : {};

  whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;
  whitelistTokenContracts   : MichelsonMap<MichelsonMapKey, unknown>;
  generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;

  lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;

}
