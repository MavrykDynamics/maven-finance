import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"
import { bob } from '../scripts/sandbox/accounts'
import { MVN } from "../test/helpers/Utils"
import { doormanStorageType } from "./storageTypes/doormanStorageType"

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Doorman',
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

export const doormanStorage: doormanStorageType = {
    
    admin                     : bob.pkh,
    mvnTokenAddress           : "",
    governanceAddress         : "",
    metadata                  : metadata,

    config                    : {
        minMvnAmount  : new BigNumber(MVN(1))
    },

    whitelistContracts        : MichelsonMap.fromLiteral({}),
    generalContracts          : MichelsonMap.fromLiteral({}),
    
    breakGlassConfig: {
        stakeMvnIsPaused           : false,
        unstakeMvnIsPaused         : false,
        exitIsPaused            : false,
        compoundIsPaused        : false,
        farmClaimIsPaused       : false,

        onVaultDepositStakeIsPaused    : false,
        onVaultWithdrawStakeIsPaused   : false,
        onVaultLiquidateStakeIsPaused  : false
    },
    userStakeBalanceLedger    : MichelsonMap.fromLiteral({}),
    
    unclaimedRewards          : new BigNumber(0),

    accumulatedFeesPerShare   : new BigNumber(0),
    
    lambdaLedger              : MichelsonMap.fromLiteral({})

};
