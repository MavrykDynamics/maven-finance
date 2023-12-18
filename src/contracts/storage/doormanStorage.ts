import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"
import { bob } from '../scripts/sandbox/accounts'
import { MVK } from "../test/helpers/Utils"
import { doormanStorageType } from "./storageTypes/doormanStorageType"

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVRYK Doorman Contract',
        version: 'v1.0.0',
        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        source: {
            tools: ['Ligo', 'Flextesa'],
            location: 'https://ligolang.org/',
        },
        }),
        'ascii',
    ).toString('hex'),
})

export const doormanStorage: doormanStorageType = {
    
    admin                     : bob.pkh,
    mvkTokenAddress           : "",
    governanceAddress         : "",
    metadata                  : metadata,

    config                    : {
        minMvkAmount  : new BigNumber(MVK(1))
    },

    whitelistContracts        : MichelsonMap.fromLiteral({}),
    generalContracts          : MichelsonMap.fromLiteral({}),
    
    breakGlassConfig: {
        stakeIsPaused           : false,
        unstakeIsPaused         : false,
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
