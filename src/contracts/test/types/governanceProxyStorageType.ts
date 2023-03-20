import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type governanceProxyStorageType = {

    admin                     : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
    
    mvkTokenAddress           : string;
    governanceAddress         : string;

    lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;
    
};