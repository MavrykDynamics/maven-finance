import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

export type treasuryFactoryStorageType = {
  
  admin                     : string;
  mvkTokenAddress           : string;
  governanceAddress         : string;

  metadata                  : MichelsonMap<MichelsonMapKey, unknown>;

  trackedTreasuries         : Array<unknown>;
  breakGlassConfig          : {};

  whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;
  whitelistTokenContracts   : MichelsonMap<MichelsonMapKey, unknown>;
  generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;

  lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;
  treasuryLambdaLedger      : MichelsonMap<MichelsonMapKey, unknown>;
  
}
