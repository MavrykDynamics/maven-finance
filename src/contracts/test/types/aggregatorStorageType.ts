import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type aggregatorStorageType = {
  
  admin                     : string;
  metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
  
  config                    : {
    decimals: BigNumber;
    percentOracleThreshold: BigNumber;
    rewardAmountXTZ: BigNumber;
    rewardAmountMVK: BigNumber;
    minimalTezosAmountDeviationTrigger: BigNumber;
    perthousandDeviationTrigger: BigNumber;
    maintainer: string;
    numberBlocksDelay: BigNumber;
  };

  mvkTokenAddress           : string;
  delegationAddress         : string;

  round                     : BigNumber;
  switchBlock               : BigNumber;
  
  oracleAddresses           : MichelsonMap<MichelsonMapKey, unknown>;
  
  deviationTriggerInfos: {
    oracleAddress: string;
    amount: BigNumber;
    roundPrice: BigNumber;
  };

  lastCompletedRoundPrice: {
    round: BigNumber;
    price: BigNumber;
    percentOracleResponse: BigNumber;
    priceDateTime: BigNumber;
  };

  observationCommits        : MichelsonMap<MichelsonMapKey, unknown>;
  observationReveals        : MichelsonMap<MichelsonMapKey, unknown>;

  oracleRewardsMVK          : MichelsonMap<MichelsonMapKey, unknown>;
  oracleRewardsXTZ          : MichelsonMap<MichelsonMapKey, unknown>;

  lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;

};
