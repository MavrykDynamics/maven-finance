import { MichelsonMap, MichelsonMapKey } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"

export type aggregatorStorageType = {
  
    admin                     : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
    name                      : string;
    config                    : {

        decimals                            : BigNumber;
        alphaPercentPerThousand             : BigNumber;

        percentOracleThreshold              : BigNumber;
        heartbeatSeconds                    : BigNumber;
        
        rewardAmountMvrk                     : BigNumber;
        rewardAmountStakedMvn               : BigNumber;
    };

    breakGlassConfig          : {
        updateDataIsPaused                 : boolean;
        withdrawRewardMvrkIsPaused           : boolean;
        withdrawRewardStakedMvnIsPaused     : boolean;
    };

    mvnTokenAddress           : string;
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

    oracleRewardStakedMvn     : MichelsonMap<MichelsonMapKey, unknown>;
    oracleRewardMvrk           : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;

};
