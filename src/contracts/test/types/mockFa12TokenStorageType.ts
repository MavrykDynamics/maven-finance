import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type mockFa12TokenStorageType = {
    
    admin               : string;
    metadata            : MichelsonMap<MichelsonMapKey, unknown>;
    token_metadata      : MichelsonMap<MichelsonMapKey, unknown>;
    whitelistContracts  : MichelsonMap<MichelsonMapKey, unknown>
    totalSupply         : BigNumber;
    ledger              : MichelsonMap<MichelsonMapKey, unknown>;

};
