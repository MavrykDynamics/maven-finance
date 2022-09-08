import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type aggregatorStorageType = {
  
    admin                     : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
    name                      : string;
    
    config                    : {
        decimals                            : BigNumber;
        alphaPercentPerThousand             : BigNumber;

        deviationTriggerBanDuration         : BigNumber;
        perThousandDeviationTrigger         : BigNumber;
        percentOracleThreshold              : BigNumber;
        heartBeatSeconds                    : BigNumber;

        requestRateDeviationDepositFee      : BigNumber;
        
        deviationRewardStakedMvk            : BigNumber;    
        deviationRewardAmountXtz            : BigNumber;    
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

    oracleAddresses           : MichelsonMap<MichelsonMapKey, unknown>;
    
    deviationTriggerInfos: {
        oracleAddress   : string;
        roundPrice      : BigNumber;
    };

    lastCompletedPrice: {
        round                 : BigNumber;
        epoch                 : BigNumber;
        price                 : BigNumber;
        percentOracleResponse : BigNumber;
        priceDateTime         : string;
    };

    deviationTriggerBan       : MichelsonMap<MichelsonMapKey, unknown>;

    oracleRewardStakedMvk     : MichelsonMap<MichelsonMapKey, unknown>;
    oracleRewardXtz           : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;

};
