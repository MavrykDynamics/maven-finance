import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from 'bignumber.js'
import { bob } from '../scripts/sandbox/accounts'
import { zeroAddress } from '../test/helpers/Utils'
import { governanceSatelliteStorageType } from './storageTypes/governanceSatelliteStorageType'

const config = {
    approvalPercentage                  : 6700,
    satelliteActionDurationInDays       : 3,
    governancePurposeMaxLength          : 1000,
    maxActionsPerSatellite              : 10
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
    
    satelliteActions                    : MichelsonMap.fromLiteral({}),
    
    satelliteAggregatorLedger           : MichelsonMap.fromLiteral({}),
    aggregatorLedger                    : MichelsonMap.fromLiteral({}),
    
    lambdaLedger                        : MichelsonMap.fromLiteral({})

}