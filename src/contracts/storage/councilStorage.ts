import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from 'bignumber.js'
import { bob } from '../scripts/sandbox/accounts'
import { councilStorageType } from './storageTypes/councilStorageType'

const config = {
    threshold                       : 3, // 3 council members required
    actionExpiryDays                : 2, // 2 days
    councilMemberNameMaxLength      : 400,
    councilMemberWebsiteMaxLength   : 400,
    councilMemberImageMaxLength     : 400,
    requestTokenNameMaxLength       : 400,
    requestPurposeMaxLength         : 400
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVRYK Council Contract',
        version: 'v1.0.0',
        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const councilStorage: councilStorageType = {
    admin                 : bob.pkh,
    mvkTokenAddress       : "",
    governanceAddress     : "",
    metadata              : metadata,
    
    config                : config,
    councilMembers        : MichelsonMap.fromLiteral({}),
    councilSize           : new BigNumber(0),

    whitelistContracts    : MichelsonMap.fromLiteral({}),
    generalContracts      : MichelsonMap.fromLiteral({}),

    councilActionsLedger  : MichelsonMap.fromLiteral({}),
    councilActionsSigners : MichelsonMap.fromLiteral({}),

    actionCounter         : new BigNumber(1),

    lambdaLedger          : MichelsonMap.fromLiteral({}),
}
