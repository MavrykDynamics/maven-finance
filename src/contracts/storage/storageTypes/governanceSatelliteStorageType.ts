import { MichelsonMap, MichelsonMapKey } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"

export type governanceSatelliteStorageType = {

    admin                               : string;
    metadata                            : MichelsonMap<MichelsonMapKey, unknown>;
    config                              : {};

    mvnTokenAddress                     : string;
    governanceAddress                   : string;

    whitelistContracts                  : MichelsonMap<MichelsonMapKey, unknown>;
    generalContracts                    : MichelsonMap<MichelsonMapKey, unknown>;

    governanceSatelliteActionLedger     : MichelsonMap<MichelsonMapKey, unknown>;
    governanceSatelliteVoters           : MichelsonMap<MichelsonMapKey, unknown>;
    governanceSatelliteCounter          : BigNumber;

    satelliteActions                    : MichelsonMap<MichelsonMapKey, unknown>;

    satelliteAggregatorLedger           : MichelsonMap<MichelsonMapKey, unknown>;
    aggregatorLedger                    : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaLedger                        : MichelsonMap<MichelsonMapKey, unknown>;
    
};