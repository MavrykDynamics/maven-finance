import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type governanceSatelliteStorageType = {

    admin                               : string;
    metadata                            : MichelsonMap<MichelsonMapKey, unknown>;
    config                              : {};

    mvkTokenAddress                     : string;
    governanceAddress                   : string;

    governanceSatelliteActionLedger     : MichelsonMap<MichelsonMapKey, unknown>;
    governanceSatelliteCounter          : BigNumber;

    currentCycleActionsInitiators       : MichelsonMap<MichelsonMapKey, unknown>;
    currentGovernanceCycle              : BigNumber;

    satelliteOracleLedger               : MichelsonMap<MichelsonMapKey, unknown>;
    aggregatorLedger                    : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaLedger                        : MichelsonMap<MichelsonMapKey, unknown>;
    
};