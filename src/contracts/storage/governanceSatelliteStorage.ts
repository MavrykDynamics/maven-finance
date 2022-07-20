import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'

const { bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import { governanceSatelliteStorageType } from '../test/types/governanceSatelliteStorageType'

const config = {
    governanceSatelliteApprovalPercentage  : 6700,
    governanceSatelliteDurationInDays      : 3,
    governancePurposeMaxLength             : 1000,
    maxActionsPerSatellite                 : 10
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVRYK Governance Satellite Contract',
        version: 'v1.0.0',
        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const governanceSatelliteStorage: governanceSatelliteStorageType = {

    admin                               : bob.pkh,
    config                              : config,
    metadata                            : metadata,
    
    mvkTokenAddress                     : zeroAddress,
    governanceAddress                   : zeroAddress,

    whitelistContracts                  : MichelsonMap.fromLiteral({}),
    generalContracts                    : MichelsonMap.fromLiteral({}),

    governanceSatelliteActionLedger     : MichelsonMap.fromLiteral({}),
    governanceSatelliteVoters           : MichelsonMap.fromLiteral({}),
    governanceSatelliteCounter          : new BigNumber(1),
    
    cycleActionsInitiators       : MichelsonMap.fromLiteral({}),
    governanceCycleSnapshot              : new BigNumber(0),
    
    satelliteOracleLedger               : MichelsonMap.fromLiteral({}),
    aggregatorLedger                    : MichelsonMap.fromLiteral({}),
    
    lambdaLedger                        : MichelsonMap.fromLiteral({})

}