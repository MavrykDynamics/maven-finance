import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder"
import { BigNumber } from "bignumber.js"

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

    mvkTokenAddress           : string;
    governanceAddress         : string;

    whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;
    generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;

    oracleLedger              : MichelsonMap<MichelsonMapKey, unknown>;
    
    lastCompletedData: {
        round                 : BigNumber;
        epoch                 : BigNumber;
        data                  : BigNumber;
        percentOracleResponse : BigNumber;
        lastUpdatedAt         : string;
    };

    oracleRewardStakedMvk     : MichelsonMap<MichelsonMapKey, unknown>;
    oracleRewardXtz           : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;

};
