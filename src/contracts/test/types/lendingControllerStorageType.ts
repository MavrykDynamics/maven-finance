import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

export type lendingControllerStorageType = {

    admin                       : string;
    metadata                    : MichelsonMap<MichelsonMapKey, unknown>;    
    config                      : {};
    breakGlassConfig            : {};

    mvkTokenAddress             : string;
    governanceAddress           : string;

    whitelistContracts          : MichelsonMap<MichelsonMapKey, unknown>;    
    generalContracts            : MichelsonMap<MichelsonMapKey, unknown>;    
    whitelistTokenContracts     : MichelsonMap<MichelsonMapKey, unknown>;

    // token pool
    rewardsLedger               : MichelsonMap<MichelsonMapKey, unknown>;
    depositorLedger             : MichelsonMap<MichelsonMapKey, unknown>;

    // vaults and owners
    vaults                      : MichelsonMap<MichelsonMapKey, unknown>;
    vaultCounter                : BigNumber;
    vaultLedger                 : MichelsonMap<MichelsonMapKey, unknown>;
    ownerLedger                 : MichelsonMap<MichelsonMapKey, unknown>;

    // collateral tokens
    collateralTokenLedger       : MichelsonMap<MichelsonMapKey, unknown>;
    loanTokenLedger             : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaLedger                : MichelsonMap<MichelsonMapKey, unknown>;
    vaultLambdaLedger           : MichelsonMap<MichelsonMapKey, unknown>;

    tempValue                   : BigNumber;

}
