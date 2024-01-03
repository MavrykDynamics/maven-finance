import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder"
import { BigNumber } from "bignumber.js"

export type doormanStorageType = {

    admin                     : string;
    mvnTokenAddress           : string;
    governanceAddress         : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;

    config                    : {
        minMvnAmount  : BigNumber
    } ;

    whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;
    generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;

    breakGlassConfig          : {};
    userStakeBalanceLedger    : MichelsonMap<MichelsonMapKey, unknown>;

    unclaimedRewards          : BigNumber;

    accumulatedFeesPerShare   : BigNumber;

    lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;
    
};
