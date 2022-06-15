import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type aggregatorStorageType = {
  
  admin                     : string;
  metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
  name                      : string;
  
  config                    : {
    decimals                            : BigNumber;
    numberBlocksDelay                   : BigNumber;

    deviationTriggerBanDuration         : BigNumber;
    perThousandDeviationTrigger         : BigNumber;
    percentOracleThreshold              : BigNumber;
    
    requestRateDeviationDepositFee      : BigNumber;
    
    deviationRewardStakedMvk            : BigNumber;    
    deviationRewardAmountXtz            : BigNumber;    
    rewardAmountXtz                     : BigNumber;
    rewardAmountStakedMvk               : BigNumber;
  };

  breakGlassConfig          : {
    requestRateUpdateIsPaused           : boolean;
    requestRateUpdateDeviationIsPaused  : boolean;
    setObservationCommitIsPaused        : boolean;
    setObservationRevealIsPaused        : boolean;
    withdrawRewardXtzIsPaused           : boolean;
    withdrawRewardStakedMvkIsPaused     : boolean;
  };

  mvkTokenAddress           : string;
  governanceAddress         : string;

  maintainer                : string;
  whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;
  generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;

  round                     : BigNumber;
  roundStart                : string;
  switchBlock               : BigNumber;
  
  oracleAddresses           : MichelsonMap<MichelsonMapKey, unknown>;
  
  deviationTriggerInfos: {
    oracleAddress   : string;
    amount          : BigNumber;
    roundPrice      : BigNumber;
  };

  lastCompletedRoundPrice: {
    round                 : BigNumber;
    price                 : BigNumber;
    percentOracleResponse : BigNumber;
    priceDateTime         : string;
  };

  observationCommits        : MichelsonMap<MichelsonMapKey, unknown>;
  observationReveals        : MichelsonMap<MichelsonMapKey, unknown>;
  deviationTriggerBan       : MichelsonMap<MichelsonMapKey, unknown>;

  oracleRewardStakedMvk     : MichelsonMap<MichelsonMapKey, unknown>;
  oracleRewardXtz           : MichelsonMap<MichelsonMapKey, unknown>;

  lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;

};
