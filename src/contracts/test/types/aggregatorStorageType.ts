import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type aggregatorStorageType = {
  
  admin                     : string;
  metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
  config                    : {};

  mvkTokenAddress           : string;

  round                     : BigNumber;
  switchBlock               : BigNumber;
  
  oracleAddresses           : MichelsonMap<MichelsonMapKey, unknown>;
  
  deviationTriggerInfos     : {};
  lastCompletedRoundPrice   : {};

  observationCommits        : MichelsonMap<MichelsonMapKey, unknown>;
  observationReveals        : MichelsonMap<MichelsonMapKey, unknown>;

  oracleRewardsMVK          : MichelsonMap<MichelsonMapKey, unknown>;
  oracleRewardsXTZ          : MichelsonMap<MichelsonMapKey, unknown>;

  lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;

};
