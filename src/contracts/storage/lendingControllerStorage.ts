import { MichelsonMap } from "@taquito/michelson-encoder"

import { BigNumber } from "bignumber.js"

const { alice, bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils"

import { lendingControllerStorageType } from "../test/types/lendingControllerStorageType"

const config = {
    collateralRatio             : 2000,    // collateral ratio (%)
    liquidationRatio            : 1500,    // liquidation ratio (%)

    liquidationFee              : 10,
    adminLiquidationFee         : 10,

    minimumLoanFee              : 10,
    // annualServiceLoanFee        : 100,
    // dailyServiceLoanFee         : 30,

    minimumLoanFeeTreasuryShare : 100,
    interestTreasuryShare : 100,


    decimals                    : 3,       // decimals 
}

const breakGlassConfig = {

    // Vault Entrypoints
    createVaultIsPaused                 : false,
    closeVaultIsPaused                  : false,
    withdrawFromVaultIsPaused           : false,
    registerDepositIsPaused             : false,
    liquidateVaultIsPaused              : false,
    borrowIsPaused                      : false,
    repayIsPaused                       : false,

    // Vault Staked MVK Entrypoints
    vaultDepositStakedMvkIsPaused       : false,
    vaultWithdrawStakedMvkIsPaused      : false,
    vaultLiquidateStakedMvkIsPaused     : false,
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVRYK Vault Controller Contract',
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


export const lendingControllerStorage : lendingControllerStorageType = {
  
    admin                           : bob.pkh,
    metadata                        : metadata,
    config                          : config,
    breakGlassConfig                : breakGlassConfig,

    mvkTokenAddress                 : zeroAddress,
    governanceAddress               : zeroAddress,

    whitelistContracts              : MichelsonMap.fromLiteral({}),
    generalContracts                : MichelsonMap.fromLiteral({}),
    whitelistTokenContracts         : MichelsonMap.fromLiteral({}),
    
    rewardsLedger                   : MichelsonMap.fromLiteral({}),
    depositorLedger                 : MichelsonMap.fromLiteral({}),

    vaults                          : MichelsonMap.fromLiteral({}),
    vaultCounter                    : new BigNumber(1),
    vaultLedger                     : MichelsonMap.fromLiteral({}),
    ownerLedger                     : MichelsonMap.fromLiteral({}),

    collateralTokenLedger           : MichelsonMap.fromLiteral({}),
    loanTokenLedger                 : MichelsonMap.fromLiteral({}),

    lambdaLedger                    : MichelsonMap.fromLiteral({}),
    vaultLambdaLedger               : MichelsonMap.fromLiteral({}),

    tempValue                       : new BigNumber(0)

}