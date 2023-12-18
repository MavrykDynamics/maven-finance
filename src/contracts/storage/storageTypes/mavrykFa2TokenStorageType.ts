import { MichelsonMap, MichelsonMapKey } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"

export type mavrykFa2TokenStorageType = {

    admin               : string;
    metadata            : MichelsonMap<MichelsonMapKey, unknown>;
    governanceAddress   : string;

    whitelistContracts  : MichelsonMap<MichelsonMapKey, unknown>;

    token_metadata      : MichelsonMap<MichelsonMapKey, unknown>;
    totalSupply         : BigNumber;
    ledger              : MichelsonMap<MichelsonMapKey, unknown>;
    operators           : MichelsonMap<MichelsonMapKey, unknown>;
    
};
