import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { bob } from '../scripts/sandbox/accounts'
import { treasuryStorageType } from "./storageTypes/treasuryStorageType"

const config = {
    minMvnAmount            : 0,
    maxMvrkAmount            : 1000000000,
}

const breakGlassConfig = {
    transferIsPaused                : false,
    mintAndTransferIsPaused         : false,
    updateTokenOperatorsIsPaused    : false
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Treasury',
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

export const treasuryStorage: treasuryStorageType = {
    
    admin                     : bob.pkh,
    mvnTokenAddress           : "",
    governanceAddress         : "",
    name                      : "treasury",
    metadata                  : metadata,

    config                    : config,
    breakGlassConfig          : breakGlassConfig,

    whitelistContracts        : MichelsonMap.fromLiteral({}),
    whitelistTokenContracts   : MichelsonMap.fromLiteral({}),
    generalContracts          : MichelsonMap.fromLiteral({}),

    lambdaLedger              : MichelsonMap.fromLiteral({})
  
};
