import { MichelsonMap } from "@taquito/michelson-encoder"

import { BigNumber } from "bignumber.js"

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils"

import { vaultControllerStorageType } from "../test/types/vaultControllerStorageType"

const config = {
    collateralRatio             : 2000,    // collateral ratio (%)
    liquidationRatio            : 1500,    // liquidation ratio (%)

    liquidationFee              : 10,
    adminLiquidationFee         : 10,

    minimumLoanFee              : 10,
    annualServiceLoanFee        : 100,
    dailyServiceLoanFee         : 30,

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


export const vaultControllerStorage : vaultControllerStorageType = {
  
    admin                           : alice.pkh,
    config                          : config,
    breakGlassConfig                : breakGlassConfig,

    mvkTokenAddress                 : zeroAddress,
    governanceAddress               : zeroAddress,

    whitelistContracts              : MichelsonMap.fromLiteral({}),
    generalContracts                : MichelsonMap.fromLiteral({}),
    whitelistTokenContracts         : MichelsonMap.fromLiteral({}),
    
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