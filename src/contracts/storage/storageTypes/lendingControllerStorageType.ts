import { MichelsonMap, MichelsonMapKey } from '@mavrykdynamics/taquito-michelson-encoder'
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

    // vaults and owners
    vaults                      : MichelsonMap<MichelsonMapKey, unknown>;
    vaultCounter                : BigNumber;
    ownerLedger                 : MichelsonMap<MichelsonMapKey, unknown>;

    // collateral tokens
    collateralTokenLedger       : MichelsonMap<MichelsonMapKey, unknown>;
    loanTokenLedger             : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaLedger                : MichelsonMap<MichelsonMapKey, unknown>;
    vaultLambdaLedger           : MichelsonMap<MichelsonMapKey, unknown>;

}
