import { MichelsonMap } from "@taquito/michelson-encoder"
import { BigNumber } from 'bignumber.js'
import { bob } from '../scripts/sandbox/accounts'
import { zeroAddress } from "test/helpers/Utils"
import { aggregatorFactoryStorageType } from "./storageTypes/aggregatorFactoryStorageType"


const config = {
    aggregatorNameMaxLength        : new BigNumber(200),
}

const breakGlassConfig = {
    createAggregatorIsPaused              : false,
    trackAggregatorIsPaused               : false,
    untrackAggregatorIsPaused             : false,
    distributeRewardXtzIsPaused           : false,
    distributeRewardStakedMvnIsPaused     : false,
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVEN Aggregator Factory Contract',
        version: 'v1.0.0',
        authors: ['MAVEN Dev Team <info@mavryk.io>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const aggregatorFactoryStorage : aggregatorFactoryStorageType = {
  
    admin                   : bob.pkh,
    metadata                : metadata,
    config                  : config,

    mvnTokenAddress         : zeroAddress,
    governanceAddress       : zeroAddress,

    generalContracts        : MichelsonMap.fromLiteral({}),
    whitelistContracts      : MichelsonMap.fromLiteral({}),

    breakGlassConfig        : breakGlassConfig,
        
    trackedAggregators      : [],
    
    lambdaLedger            : MichelsonMap.fromLiteral({}),
    aggregatorLambdaLedger  : MichelsonMap.fromLiteral({}),
    
};