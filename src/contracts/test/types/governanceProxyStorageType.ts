import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type governanceProxyStorageType = {

    admin                     : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
    
    mvkTokenAddress           : string;
    governanceAddress         : string;
    proxyNodeAddresses        : [];
    
    whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;
    generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;
    whitelistTokenContracts   : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaPointerLedger       : MichelsonMap<MichelsonMapKey, unknown>;
    proxyLambdaLedger         : MichelsonMap<MichelsonMapKey, unknown>;
    lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;
    
};