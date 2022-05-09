import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

export type aggregatorFactoryStorageType = {
  
  admin                     : string;
  metadata                  : MichelsonMap<MichelsonMapKey, unknown>;

  mvkTokenAddress           : string;
  delegationAddress         : string;
  

  trackedAggregators        : MichelsonMap<MichelsonMapKey, unknown>;
  trackedSatellites         : Array<unknown>;

  lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;
  aggregatorLambdaLedger    : MichelsonMap<MichelsonMapKey, unknown>;
};
