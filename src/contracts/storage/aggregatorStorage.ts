import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

const { bob, oracleMaintainer } = require('../scripts/sandbox/accounts')
const {oracles} = require('../scripts/sandbox/oracles')

import { aggregatorStorageType } from '../test/types/aggregatorStorageType'

import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';

const breakGlassConfig = {
    updateDataIsPaused                 : false,
    withdrawRewardXtzIsPaused           : false,
    withdrawRewardStakedMvkIsPaused     : false
}

const config = {
    nameMaxLength                       : new BigNumber(200),
    decimals                            : new BigNumber(8),
    alphaPercentPerThousand             : new BigNumber(2),
    
    percentOracleThreshold              : new BigNumber(49),
    heartBeatSeconds                    : new BigNumber(3),
    
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

const oraclesMap = {};

for (const oracle of oracles) {
    oraclesMap[oracle.pkh] = true
}

const oracleAddresses = MichelsonMap.fromLiteral({});


const lastCompletedPrice = {
    round                   : new BigNumber(0),
    epoch                   : new BigNumber(0),
    price                   : new BigNumber(0),
    percentOracleResponse   : new BigNumber(0),
    priceDateTime           : '1'
}

export const aggregatorStorage: aggregatorStorageType = {

    admin                     : bob.pkh,
    metadata                  : metadata,
    name                      : 'name',
    config                    : config,
    breakGlassConfig          : breakGlassConfig,
    
    mvkTokenAddress           : mvkTokenAddress.address,
    governanceAddress         : governanceAddress.address,

    whitelistContracts        : MichelsonMap.fromLiteral({}),
    generalContracts          : MichelsonMap.fromLiteral({}),

    oracleAddresses           : oracleAddresses,
    
    lastCompletedPrice        : lastCompletedPrice,
    

    oracleRewardStakedMvk     : MichelsonMap.fromLiteral({}),
    oracleRewardXtz           : MichelsonMap.fromLiteral({}),

    lambdaLedger              : MichelsonMap.fromLiteral({}),

}
