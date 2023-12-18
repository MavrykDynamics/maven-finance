import { MichelsonMap, MichelsonMapKey } from "@mavrykdynamics/taquito-michelson-encoder"

export type governanceProxyStorageType = {

    admin                     : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
    
    mvkTokenAddress           : string;
    governanceAddress         : string;

    lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;
    
};