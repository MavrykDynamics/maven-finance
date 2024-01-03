import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder"
import { BigNumber } from "bignumber.js"

export type vaultFactoryStorageType = {

    admin                 : string;
    metadata              : MichelsonMap<MichelsonMapKey, unknown>;
    vaultMetadata         : MichelsonMap<MichelsonMapKey, unknown>;
    config                : {
        vaultNameMaxLength   : BigNumber
    };

    mvnTokenAddress       : string;
    governanceAddress     : string;

    generalContracts      : MichelsonMap<MichelsonMapKey, unknown>;
    whitelistContracts    : MichelsonMap<MichelsonMapKey, unknown>;

    breakGlassConfig      : {
        createVaultIsPaused  : boolean;
    }
    
    vaultCounter          : BigNumber;

    lambdaLedger          : MichelsonMap<MichelsonMapKey, unknown>;
    vaultLambdaLedger     : MichelsonMap<MichelsonMapKey, unknown>;

};