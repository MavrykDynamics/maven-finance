import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type aggregatorStorageType = {
  
    admin                     : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
    name                      : string;
    config                    : {
        decimals                            : BigNumber;
        alphaPercentPerThousand             : BigNumber;

        percentOracleThreshold              : BigNumber;
        heartBeatSeconds                    : BigNumber;

        
        rewardAmountXtz                     : BigNumber;
        rewardAmountStakedMvk               : BigNumber;
    };

    breakGlassConfig          : {
        updateDataIsPaused                 : boolean;
        withdrawRewardXtzIsPaused           : boolean;
        withdrawRewardStakedMvkIsPaused     : boolean;
    };

    trackedAggregators        : MichelsonMap<{ 0: string; 1: string }, string>
    mvkTokenAddress           : string;
    governanceAddress         : string;

    whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;
    generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;

    oracleAddresses           : MichelsonMap<MichelsonMapKey, unknown>;
    

    lastCompletedPrice: {
        round                 : BigNumber;
        epoch                 : BigNumber;
        price                 : BigNumber;
        percentOracleResponse : BigNumber;
        priceDateTime         : string;
    };


    oracleRewardStakedMvk     : MichelsonMap<MichelsonMapKey, unknown>;
    oracleRewardXtz           : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;

};
