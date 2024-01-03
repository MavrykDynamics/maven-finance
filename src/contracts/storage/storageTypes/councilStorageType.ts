import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder"
import { BigNumber } from "bignumber.js"

export type councilStorageType = {
    
    admin                   : string;
    mvnTokenAddress         : string;
    governanceAddress       : string;
    metadata                : MichelsonMap<MichelsonMapKey, unknown>;

    config                  : {};
    councilMembers          : MichelsonMap<MichelsonMapKey, unknown>;
    councilSize             : BigNumber;

    whitelistContracts      : MichelsonMap<MichelsonMapKey, unknown>;
    generalContracts        : MichelsonMap<MichelsonMapKey, unknown>;

    councilActionsLedger    : MichelsonMap<MichelsonMapKey, unknown>;
    councilActionsSigners   : MichelsonMap<MichelsonMapKey, unknown>;

    actionCounter           : BigNumber;

    lambdaLedger            : MichelsonMap<MichelsonMapKey, unknown>;

};
