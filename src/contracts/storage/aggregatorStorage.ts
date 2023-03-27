import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'
import { bob } from '../scripts/sandbox/accounts'
import { zeroAddress } from '../test/helpers/Utils'
import { aggregatorStorageType } from './storageTypes/aggregatorStorageType'


const breakGlassConfig = {
    updateDataIsPaused                 : false,
    withdrawRewardXtzIsPaused           : false,
    withdrawRewardStakedMvkIsPaused     : false
}

const config = {
    decimals                            : new BigNumber(8),
    alphaPercentPerThousand             : new BigNumber(2),
    
    percentOracleThreshold              : new BigNumber(49),
    heartBeatSeconds                    : new BigNumber(300),
    
    rewardAmountStakedMvk               : new BigNumber(10000000), // 0.01 MVK
    rewardAmountXtz                     : new BigNumber(1300),     // ~0.0013 tez 
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVRYK Aggregator Contract',
        version: 'v1.0.0',
        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
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
    
    mvkTokenAddress           : zeroAddress,
    governanceAddress         : zeroAddress,

    whitelistContracts        : MichelsonMap.fromLiteral({}),
    generalContracts          : MichelsonMap.fromLiteral({}),

    oracleLedger              : oracleLedger,
    
    lastCompletedData         : lastCompletedData,

    oracleRewardStakedMvk     : MichelsonMap.fromLiteral({}),
    oracleRewardXtz           : MichelsonMap.fromLiteral({}),

    lambdaLedger              : MichelsonMap.fromLiteral({}),

}
