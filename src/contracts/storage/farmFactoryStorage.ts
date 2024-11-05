import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { bob } from '../scripts/sandbox/accounts'
import { BigNumber } from "bignumber.js"
import { farmFactoryStorageType } from "./storageTypes/farmFactoryStorageType"

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Farm Factory',
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

export const farmFactoryStorage: farmFactoryStorageType = {
    
    admin                 : bob.pkh,
    metadata              : metadata,
    mvnTokenAddress       : "",
    governanceAddress     : "",
    config                : {
        farmNameMaxLength     : new BigNumber(100)
    },
    breakGlassConfig      : {
        createFarmIsPaused  : false,
        trackFarmIsPaused   : false,
        untrackFarmIsPaused : false,
    },
    
    generalContracts      : MichelsonMap.fromLiteral({}),
    whitelistContracts    : MichelsonMap.fromLiteral({}),

    trackedFarms          : [],

    lambdaLedger          : MichelsonMap.fromLiteral({}),
    farmLambdaLedger      : MichelsonMap.fromLiteral({}),
    mFarmLambdaLedger     : MichelsonMap.fromLiteral({})

};