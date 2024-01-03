import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'
import { bob } from '../scripts/sandbox/accounts'
import { vestingStorageType } from './storageTypes/vestingStorageType'

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
            name: 'MAVEN Vesting Contract',
            version: 'v1.0.0',
            authors: ['MAVEN Dev Team <info@mavryk.io>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const vestingStorage: vestingStorageType = {
    
    admin               : bob.pkh,
    mvnTokenAddress     : "",
    governanceAddress   : "",
    metadata            : metadata,

    whitelistContracts  : MichelsonMap.fromLiteral({}),
    generalContracts    : MichelsonMap.fromLiteral({}),

    vesteeLedger        : MichelsonMap.fromLiteral({}),

    totalVestedAmount   : new BigNumber(0),

    lambdaLedger        : MichelsonMap.fromLiteral({}),

}
