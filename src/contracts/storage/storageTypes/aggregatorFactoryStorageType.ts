import { MichelsonMap, MichelsonMapKey } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"

export type aggregatorFactoryStorageType = {
  
    admin                     : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
    breakGlassConfig          : {
        createAggregatorIsPaused              : boolean;
        trackAggregatorIsPaused               : boolean;
        untrackAggregatorIsPaused             : boolean;
        distributeRewardMvrkIsPaused           : boolean;
        distributeRewardStakedMvnIsPaused     : boolean;
    };
    config                    : {
        aggregatorNameMaxLength               : BigNumber;
    }

    generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;
    whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;

    mvnTokenAddress           : string;
    governanceAddress         : string;
    
    trackedAggregators        : Array<unknown>;

    lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;
    aggregatorLambdaLedger    : MichelsonMap<MichelsonMapKey, unknown>;

};
