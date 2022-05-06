import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type aggregatorFactoryStorageType = {
  
  admin                     : string;
  mvkTokenAddress           : string;
  delegationAddress         : string;
  
  metadata                  : MichelsonMap<MichelsonMapKey, unknown>;

  trackedAggregators        : MichelsonMap<MichelsonMapKey, unknown>;
  trackedSatellites         : Array<unknown>;

  lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;

};
