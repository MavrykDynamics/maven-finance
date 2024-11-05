import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from 'bignumber.js'
import { bob } from '../scripts/sandbox/accounts'
import { councilStorageType } from './storageTypes/councilStorageType'

const config = {
    threshold                       : 3, // 3 council members required
    actionExpiryDays                : 2, // 2 days
    councilMemberNameMaxLength      : 400,
    councilMemberWebsiteMaxLength   : 400,
    councilMemberImageMaxLength     : 400,
    requestTokenNameMaxLength       : 400,
    requestPurposeMaxLength         : 400
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Council',
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

export const councilStorage: councilStorageType = {
    admin                 : bob.pkh,
    mvnTokenAddress       : "",
    governanceAddress     : "",
    metadata              : metadata,
    
    config                : config,
    councilMembers        : MichelsonMap.fromLiteral({}),
    councilSize           : new BigNumber(0),

    whitelistContracts    : MichelsonMap.fromLiteral({}),
    generalContracts      : MichelsonMap.fromLiteral({}),

    councilActionsLedger  : MichelsonMap.fromLiteral({}),
    councilActionsSigners : MichelsonMap.fromLiteral({}),

    actionCounter         : new BigNumber(1),

    lambdaLedger          : MichelsonMap.fromLiteral({}),
}
