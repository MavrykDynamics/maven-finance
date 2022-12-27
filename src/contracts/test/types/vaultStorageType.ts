import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'
import { alice } from '../../scripts/sandbox/accounts'

type depositorsType = {
    depositorsConfig        : string;
    whitelistedDepositors   : [];
}

export type vaultStorageType = {
    
    admin                       : string;
    metadata                    : MichelsonMap<MichelsonMapKey, unknown>;
    mvkTokenAddress             : string;
    governanceAddress           : string;
    
    handle                      : {};
    depositors                  : depositorsType;

    lambdaLedger                : MichelsonMap<MichelsonMapKey, unknown>;
}
