import { MichelsonMap, MichelsonMapKey } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from 'bignumber.js'

export type lendingControllerMockTimeStorageType = {

    admin                       : string; 
    tester                      : string;
    metadata                    : MichelsonMap<MichelsonMapKey, unknown>;    
    // config                      : {};
    // breakGlassConfig            : {};

    vaultConfigLedger           : MichelsonMap<MichelsonMapKey, unknown>;    
    breakGlassLedger            : MichelsonMap<MichelsonMapKey, unknown>;    

    mvnTokenAddress             : string;
    governanceAddress           : string;

    // vaults and owners
    vaults                      : MichelsonMap<MichelsonMapKey, unknown>;
    ownerLedger                 : MichelsonMap<MichelsonMapKey, unknown>;

    // collateral tokens
    collateralTokenLedger       : MichelsonMap<MichelsonMapKey, unknown>;
    loanTokenLedger             : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaLedger                : MichelsonMap<MichelsonMapKey, unknown>;
    vaultLambdaLedger           : MichelsonMap<MichelsonMapKey, unknown>;

}
