import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'
import { alice } from '../../scripts/sandbox/accounts'

export type vaultStorageType = {
    
    admin                       : string;
    metadata                    : MichelsonMap<MichelsonMapKey, unknown>;
    controllerAddress           : string;
    governanceAddress           : string;
    
    handle                      : {};
    depositors                  : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaLedger                : MichelsonMap<MichelsonMapKey, unknown>;
}
