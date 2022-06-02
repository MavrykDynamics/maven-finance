import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

export type aggregatorFactoryStorageType = {
  
  admin                     : string;
  metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
  breakGlassConfig          : {
    createAggregatorIsPaused        : boolean;
    trackAggregatorIsPaused         : boolean;
    untrackAggregatorIsPaused       : boolean;
    distributeRewardXtzIsPaused     : boolean;
    distributeRewardMvkIsPaused     : boolean;
  };

  generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;
  whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;

  mvkTokenAddress           : string;
  governanceAddress         : string;
  
  // trackedAggregators        : Array<unknown>;
  trackedAggregators        : MichelsonMap<MichelsonMapKey, unknown>;
  trackedSatellites         : Array<unknown>;

  lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;
  aggregatorLambdaLedger    : MichelsonMap<MichelsonMapKey, unknown>;
};
