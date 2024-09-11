import { MichelsonMap, MichelsonMapKey } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"

export type vestingStorageType = {

    admin               : string;
    governanceAddress   : string;
    mvnTokenAddress     : string;
    metadata            : MichelsonMap<MichelsonMapKey, unknown>;

    whitelistContracts  : MichelsonMap<MichelsonMapKey, unknown>;
    generalContracts    : MichelsonMap<MichelsonMapKey, unknown>;

    vesteeLedger        : MichelsonMap<MichelsonMapKey, unknown>;

    totalVestedAmount   : BigNumber; 

    lambdaLedger        : MichelsonMap<MichelsonMapKey, unknown>;
    
};
