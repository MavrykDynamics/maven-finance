import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'

import { BigNumber } from 'bignumber.js'
import { Buffer } from 'buffer'

import { MVN, zeroAddress } from '../test/helpers/Utils'

import { mvnFaucetStorageType } from './storageTypes/mvnFaucetStorageType'
import { bob } from 'scripts/sandbox/accounts'

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVEN Faucet Contract',
        version: 'v1.0.0',
        authors: ['MAVEN Dev Team <info@mavryk.io>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const mvnFaucetStorage: mvnFaucetStorageType = {
    
    admin: bob.pkh,
    metadata: metadata,
    tokens: MichelsonMap.fromLiteral({}),
    requesters: MichelsonMap.fromLiteral({}),

}
