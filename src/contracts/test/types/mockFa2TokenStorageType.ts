import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type mockFa2TokenStorageType = {

    admin           : string;
    metadata        : MichelsonMap<MichelsonMapKey, unknown>;
    token_metadata  : MichelsonMap<MichelsonMapKey, unknown>;
    totalSupply     : BigNumber;
    ledger          : MichelsonMap<MichelsonMapKey, unknown>;
    operators       : MichelsonMap<MichelsonMapKey, unknown>;
    
};
