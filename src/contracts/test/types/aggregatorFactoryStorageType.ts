import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

export type aggregatorFactoryStorageType = {
  
  admin                     : string;
  mvkTokenAddress           : string;
  
  metadata                  : MichelsonMap<MichelsonMapKey, unknown>;

  trackedAggregators        : MichelsonMap<MichelsonMapKey, unknown>;
  trackedSatellites         : Array<unknown>;

  lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;
  aggregatorlambdaLedger    : MichelsonMap<MichelsonMapKey, unknown>;
};
