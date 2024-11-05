import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from 'bignumber.js'
import { bob } from '../scripts/sandbox/accounts'
import { vestingStorageType } from './storageTypes/vestingStorageType'

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Vesting',
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

export const vestingStorage: vestingStorageType = {
    
    admin               : bob.pkh,
    mvnTokenAddress     : "",
    governanceAddress   : "",
    metadata            : metadata,

    whitelistContracts  : MichelsonMap.fromLiteral({}),
    generalContracts    : MichelsonMap.fromLiteral({}),

    vesteeLedger        : MichelsonMap.fromLiteral({}),

    totalVestedAmount   : new BigNumber(0),

    lambdaLedger        : MichelsonMap.fromLiteral({}),

}
