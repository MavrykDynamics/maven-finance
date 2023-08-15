import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder"
import { BigNumber } from "bignumber.js"

export type breakGlassStorageType = {

    admin               : string;
    mvkTokenAddress     : string;
    governanceAddress   : string;
    metadata            : MichelsonMap<MichelsonMapKey, unknown>;

    config              : {};
    glassBroken         : boolean;
    councilMembers      : MichelsonMap<MichelsonMapKey, unknown>;
    councilSize         : BigNumber;

    whitelistContracts  : MichelsonMap<MichelsonMapKey, unknown>;
    generalContracts    : MichelsonMap<MichelsonMapKey, unknown>;

    actionsLedger       : MichelsonMap<MichelsonMapKey, unknown>;
    actionsSigners      : MichelsonMap<MichelsonMapKey, unknown>;
    actionCounter       : BigNumber;

    lambdaLedger        : MichelsonMap<MichelsonMapKey, unknown>;
    
};
