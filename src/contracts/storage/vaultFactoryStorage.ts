import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { bob } from '../scripts/sandbox/accounts'
import { BigNumber } from "bignumber.js"
import { vaultFactoryStorageType } from "./storageTypes/vaultFactoryStorageType"

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Vault Factory',
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

export const vaultFactoryStorage: vaultFactoryStorageType = {
    
    admin                 : bob.pkh,
    metadata              : metadata,
    config                : {
        vaultNameMaxLength     : new BigNumber(100)
    },

    mvnTokenAddress       : "",
    governanceAddress     : "",
    
    generalContracts      : MichelsonMap.fromLiteral({}),
    whitelistContracts    : MichelsonMap.fromLiteral({}),

    breakGlassConfig      : {
        createVaultIsPaused  : false
    },

    vaultCounter          : new BigNumber(1),

    lambdaLedger          : MichelsonMap.fromLiteral({}),
    vaultLambdaLedger      : MichelsonMap.fromLiteral({})

};