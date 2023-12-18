import { MichelsonMap, MichelsonMapKey } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"

export type mvkTokenStorageType = {
  
    admin                     : string;
    governanceAddress         : string;
    
    generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;
    whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;

    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
    token_metadata            : MichelsonMap<MichelsonMapKey, unknown>;

    totalSupply               : BigNumber;
    maximumSupply             : BigNumber;
    inflationRate             : BigNumber;
    nextInflationTimestamp    : string;

    ledger                    : MichelsonMap<MichelsonMapKey, unknown>;
    operators                 : MichelsonMap<MichelsonMapKey, unknown>;
    
};
