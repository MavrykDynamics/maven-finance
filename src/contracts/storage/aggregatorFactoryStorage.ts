import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
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
    distributeRewardMvrkIsPaused           : false,
    distributeRewardStakedMvnIsPaused     : false,
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Aggregator Factory',
        version: 'v1.0.0',
        authors: ['Mavryk Dynamics <info@mavryk.io>'],
        homepage: "https://mavenfinance.io",
        license: {
            name: "MIT"
        },
        source: {
            tools: [
                "MavrykLIGO 0.60.0",
                "Flexmasa atlas-update-run"
            ],
            location: "https://github.com/mavenfinance/maven-finance"
        },
        interfaces: [ 'TZIP-16' ],
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