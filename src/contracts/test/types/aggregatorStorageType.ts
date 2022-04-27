import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type aggregatorStorageType = {
  
  admin                     : string;
  mvkTokenAddress           : string;
  config                    : {};
  // metadata            : MichelsonMap<MichelsonMapKey, unknown>;

  round                     : BigNumber;
  switchBlock               : BigNumber;
  
  oracleAddresses           : MichelsonMap<MichelsonMapKey, unknown>;
  
  deviationTriggerInfos     : MichelsonMap<MichelsonMapKey, unknown>;
  lastCompletedRoundPrice   : MichelsonMap<MichelsonMapKey, unknown>;

  observationCommits        : MichelsonMap<MichelsonMapKey, unknown>;
  observationReveals        : MichelsonMap<MichelsonMapKey, unknown>;

  oracleRewardsMVK          : MichelsonMap<MichelsonMapKey, unknown>;
  oracleRewardsXTZ          : MichelsonMap<MichelsonMapKey, unknown>;

  lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;

};
