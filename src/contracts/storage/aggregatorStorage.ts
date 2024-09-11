import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from 'bignumber.js'

import { bob } from '../scripts/sandbox/accounts'
import { zeroAddress } from '../test/helpers/Utils'
import { aggregatorStorageType } from './storageTypes/aggregatorStorageType'

const breakGlassConfig = {
    updateDataIsPaused                 : false,
    withdrawRewardMvrkIsPaused           : false,
    withdrawRewardStakedMvnIsPaused     : false
}

const config = {
    decimals                            : new BigNumber(8),
    alphaPercentPerThousand             : new BigNumber(2),
    
    percentOracleThreshold              : new BigNumber(49),
    heartbeatSeconds                    : new BigNumber(300),
    
    rewardAmountStakedMvn               : new BigNumber(10000000), // 0.01 MVN
    rewardAmountMvrk                     : new BigNumber(1300),     // ~0.0013 mav 
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVEN Aggregator Contract',
        version: 'v1.0.0',
        authors: ['MAVEN Dev Team <info@mavryk.io>'],
        }),
        'ascii',
    ).toString('hex'),
})

const oracleLedger = MichelsonMap.fromLiteral({});

const lastCompletedData = {
    round                   : new BigNumber(0),
    epoch                   : new BigNumber(0),
    data                    : new BigNumber(0),
    percentOracleResponse   : new BigNumber(0),
    lastUpdatedAt           : '1'
}

export const aggregatorStorage: aggregatorStorageType = {

    admin                     : bob.pkh,
    metadata                  : metadata,
    name                      : 'name',
    config                    : config,
    breakGlassConfig          : breakGlassConfig,
    
    mvnTokenAddress           : zeroAddress,
    governanceAddress         : zeroAddress,

    whitelistContracts        : MichelsonMap.fromLiteral({}),
    generalContracts          : MichelsonMap.fromLiteral({}),

    oracleLedger              : oracleLedger,
    
    lastCompletedData         : lastCompletedData,

    oracleRewardStakedMvn     : MichelsonMap.fromLiteral({}),
    oracleRewardMvrk           : MichelsonMap.fromLiteral({}),

    lambdaLedger              : MichelsonMap.fromLiteral({}),

}
