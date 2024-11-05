import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { bob } from '../scripts/sandbox/accounts'
import { governanceProxyStorageType } from "./storageTypes/governanceProxyStorageType"

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Proxy Governance',
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

export const governanceProxyStorage: governanceProxyStorageType = {

    admin                     : bob.pkh,
    metadata                  : metadata,
    
    mvnTokenAddress           : "",
    governanceAddress         : bob.pkh,

    lambdaLedger              : MichelsonMap.fromLiteral({})

};