import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'

import { BigNumber } from 'bignumber.js'
import { Buffer } from 'buffer'

import { MVK, zeroAddress } from '../test/helpers/Utils'

import { mvkFaucetStorageType } from './storageTypes/mvkFaucetStorageType'

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVRYK Faucet Contract',
        version: 'v1.0.0',
        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const mvkFaucetStorage: mvkFaucetStorageType = {
    
    mvkTokenAddress: zeroAddress,
    metadata: metadata,
    amountPerUser: new BigNumber(MVK(1000)),
    requesters: MichelsonMap.fromLiteral({}),

}
