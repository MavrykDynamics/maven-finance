import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder"

export type governanceProxyStorageType = {

    admin                     : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
    
    mvkTokenAddress           : string;
    governanceAddress         : string;

    lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;
    
};