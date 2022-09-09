import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

export type tokenSaleStorageType = {
  
  admin                     : string;
  metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
  config                    : {};

  governanceAddress         : string;
  treasuryAddress           : string;
  mvkTokenAddress           : string;

  tokenSaleLedger           : MichelsonMap<MichelsonMapKey, unknown>;
  whitelistedAddresses      : MichelsonMap<MichelsonMapKey, unknown>;

  whitelistStartTimestamp   : String;
  whitelistEndTimestamp     : String;

  tokenSaleHasStarted       : boolean;
  tokenSaleHasEnded         : boolean;
  tokenSalePaused           : boolean;

  tokenSaleEndTimestamp     : String;
  tokenSaleEndBlockLevel    : BigNumber;
  
}