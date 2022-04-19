import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type farmFactoryStorageType = {
  admin                 : string;
  metadata              : MichelsonMap<MichelsonMapKey, unknown>;
  mvkTokenAddress       : string;
  config                : BigNumber;
  breakGlassConfig      : {
    createFarmIsPaused  : boolean;
    trackFarmIsPaused   : boolean;
    untrackFarmIsPaused : boolean;
  }

  generalContracts      : MichelsonMap<MichelsonMapKey, unknown>;
  whitelistContracts    : MichelsonMap<MichelsonMapKey, unknown>;
  
  trackedFarms          : Array<unknown>;

  lambdaLedger          : MichelsonMap<MichelsonMapKey, unknown>;
};