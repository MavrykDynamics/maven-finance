import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder"
import { BigNumber } from "bignumber.js"

export type farmFactoryStorageType = {

    admin                 : string;
    governanceAddress     : string;
    mvnTokenAddress       : string;
    metadata              : MichelsonMap<MichelsonMapKey, unknown>;
    config                : {
        farmNameMaxLength   : BigNumber
    };
    breakGlassConfig      : {
        createFarmIsPaused  : boolean;
        trackFarmIsPaused   : boolean;
        untrackFarmIsPaused : boolean;
    }

    generalContracts      : MichelsonMap<MichelsonMapKey, unknown>;
    whitelistContracts    : MichelsonMap<MichelsonMapKey, unknown>;
    
    trackedFarms          : Array<unknown>;

    lambdaLedger          : MichelsonMap<MichelsonMapKey, unknown>;
    farmLambdaLedger      : MichelsonMap<MichelsonMapKey, unknown>;
    mFarmLambdaLedger     : MichelsonMap<MichelsonMapKey, unknown>;

};