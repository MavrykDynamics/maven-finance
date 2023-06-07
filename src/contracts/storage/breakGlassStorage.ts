import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'
import { bob } from '../scripts/sandbox/accounts'
import { breakGlassStorageType } from './storageTypes/breakGlassStorageType'

const config = {
    threshold                       : 3,
    actionExpiryDays                : 3,
    councilMemberNameMaxLength      : 400,
    councilMemberWebsiteMaxLength   : 400,
    councilMemberImageMaxLength     : 400,
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVRYK Break Glass Contract',
        version: 'v1.0.0',
        authors: ['MAVRYK Dev Team <contact@mavryk.finance>']
        }),
        'ascii',
    ).toString('hex'),
})

export const breakGlassStorage: breakGlassStorageType = {
    
    admin               : bob.pkh,
    mvkTokenAddress     : "",
    governanceAddress   : "",
    metadata            : metadata,

    config              : config,
    glassBroken         : false,
    councilMembers      : MichelsonMap.fromLiteral({}),
    councilSize         : new BigNumber(0),

    whitelistContracts  : MichelsonMap.fromLiteral({}),
    generalContracts    : MichelsonMap.fromLiteral({}),
    
    actionsLedger       : MichelsonMap.fromLiteral({}),
    actionCounter       : new BigNumber(1),

    lambdaLedger        : MichelsonMap.fromLiteral({})

}
