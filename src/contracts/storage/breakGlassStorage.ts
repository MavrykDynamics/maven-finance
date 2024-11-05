import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from 'bignumber.js'
import { bob } from '../scripts/sandbox/accounts'
import { breakGlassStorageType } from './storageTypes/breakGlassStorageType'

const config = {
    threshold                       : 3,
    actionExpiryDays                : 3,
    councilMemberNameMaxLength      : 400,
    councilMemberWebsiteMaxLength   : 400,
    councilMemberImageMaxLength     : 400,
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Break Glass',
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

export const breakGlassStorage: breakGlassStorageType = {
    
    admin               : bob.pkh,
    mvnTokenAddress     : "",
    governanceAddress   : "",
    metadata            : metadata,

    config              : config,
    glassBroken         : false,
    councilMembers      : MichelsonMap.fromLiteral({}),
    councilSize         : new BigNumber(0),

    whitelistContracts  : MichelsonMap.fromLiteral({}),
    generalContracts    : MichelsonMap.fromLiteral({}),
    
    actionsLedger       : MichelsonMap.fromLiteral({}),
    actionsSigners      : MichelsonMap.fromLiteral({}),
    actionCounter       : new BigNumber(1),

    lambdaLedger        : MichelsonMap.fromLiteral({})

}
