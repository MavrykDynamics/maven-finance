import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

export type tokenPoolStorageType = {

    admin                     : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
    config                    : {};
    breakGlassConfig          : {};

    mvkTokenAddress           : string;
    governanceAddress         : string;
    
    whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;
    whitelistTokenContracts   : MichelsonMap<MichelsonMapKey, unknown>;
    generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;

    tokenLedger               : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;

}
