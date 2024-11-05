import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"
import { bob } from '../scripts/sandbox/accounts'
import { treasuryFactoryStorageType } from "./storageTypes/treasuryFactoryStorageType"

const breakGlassConfig = {
    createTreasuryIsPaused   : false,
    trackTreasuryIsPaused    : false,
    untrackTreasuryIsPaused  : false
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Treasury Factory',
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
        interfaces: [ 'MIP-16' ],
        }),
        'ascii',
    ).toString('hex'),
})

export const treasuryFactoryStorage: treasuryFactoryStorageType = {
    
    admin                     : bob.pkh,
    mvnTokenAddress           : "",
    governanceAddress         : "",
    metadata                  : metadata,

    config                    : {
        treasuryNameMaxLength   : new BigNumber(100)
    },

    trackedTreasuries         : [],
    breakGlassConfig          : breakGlassConfig,

    whitelistContracts        : MichelsonMap.fromLiteral({}),
    whitelistTokenContracts   : MichelsonMap.fromLiteral({}),
    generalContracts          : MichelsonMap.fromLiteral({}),

    lambdaLedger              : MichelsonMap.fromLiteral({}),
    treasuryLambdaLedger      : MichelsonMap.fromLiteral({})

};
