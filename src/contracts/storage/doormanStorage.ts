import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"
import { bob } from '../scripts/sandbox/accounts'
import { MVN } from "../test/helpers/Utils"
import { doormanStorageType } from "./storageTypes/doormanStorageType"

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVEN Doorman Contract',
        version: 'v1.0.0',
        authors: ['MAVEN Dev Team <info@mavryk.io>'],
        source: {
            tools: ['Ligo', 'Flexmasa'],
            location: 'https://ligolang.org/',
        },
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
