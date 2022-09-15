import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

export type tokenPoolRewardStorageType = {

    admin                     : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
    breakGlassConfig          : {};

    mvkTokenAddress           : string;
    governanceAddress         : string;
    
    whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;
    whitelistTokenContracts   : MichelsonMap<MichelsonMapKey, unknown>;
    generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;

    rewardsLedger             : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;

}
