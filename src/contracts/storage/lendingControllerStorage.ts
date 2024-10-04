import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"
import { bob } from '../scripts/sandbox/accounts'
import { zeroAddress } from "../test/helpers/Utils"
import { lendingControllerStorageType } from "./storageTypes/lendingControllerStorageType"

const config = {
    decimals                    : 4,       // decimals 
    interestRateDecimals        : 27,      // interest rate decimals
    maxDecimalsForCalculation   : 32,
    lastCompletedDataMaxDelay   : 9999999999, // for testing purposes - prod: 300 (i.e. 5 mins) 
}

const vaultConfig = {
    collateralRatio             : 2000,    // collateral ratio (%)
    liquidationRatio            : 1500,    // liquidation ratio (%)

    liquidationFeePercent       : 600,
    adminLiquidationFeePercent  : 600,
    minimumLoanFeePercent       : 100,

    minimumLoanFeeTreasuryShare : 4000,
    interestTreasuryShare       : 100,

    maxVaultLiquidationPercent  : 5000,    // 50%      
    liquidationDelayInMins      : 120,
    liquidationMaxDuration      : 1440,

    interestRepaymentPeriod      : 0,
    missedPeriodsForLiquidation  : 0,
    interestRepaymentGrace       : 0,    
    penaltyFeePercentage         : 0,    
    liquidationConfig            : 0
}

const vaultRwaConfig = {
    collateralRatio             : 3000,    // collateral ratio (%)
    liquidationRatio            : 3500,    // liquidation ratio (%)

    liquidationFeePercent       : 300,
    adminLiquidationFeePercent  : 300,
    minimumLoanFeePercent       : 300,

    minimumLoanFeeTreasuryShare : 4000,
    interestTreasuryShare       : 100,

    maxVaultLiquidationPercent  : 5000,    // 50%      
    liquidationDelayInMins      : 120,
    liquidationMaxDuration      : 1440,

    interestRepaymentPeriod      : 30,
    missedPeriodsForLiquidation  : 4,
    interestRepaymentGrace       : 10,    
    penaltyFeePercentage         : 10,    
    liquidationConfig            : "rwa"  
}

const breakGlassConfig = {

    // Token Pool Entrypoints
    setLoanTokenIsPaused                : false,
    addLiquidityIsPaused                : false,
    removeLiquidityIsPaused             : false,

    // Vault Entrypoints
    updateCollateralTokenIsPaused       : false,
    createVaultIsPaused                 : false,
    closeVaultIsPaused                  : false,
    registerDepositIsPaused             : false,
    registerWithdrawalIsPaused          : false,
    markForLiquidationIsPaused          : false,
    liquidateVaultIsPaused              : false,
    borrowIsPaused                      : false,
    repayIsPaused                       : false,

    // Vault Staked Token Entrypoints
    vaultDepositStakedTokenIsPaused     : false,
    vaultWithdrawStakedTokenIsPaused    : false
}

const vaultConfigLedger = MichelsonMap.fromLiteral({
    0: vaultConfig,
    1: vaultRwaConfig
})


const breakGlassLedger = MichelsonMap.fromLiteral({
    
    "vaultDeposit" : false,
    "vaultWithdraw" : false,
    "onLiquidate" : false,

    "setLoanToken" : false,
    "addLiquidity" : false,
    "removeLiquidity" : false,

    "updateCollateralToken" : false,
    "createVault" : false,
    "closeVault" : false,
    "registerDeposit" : false,
    "registerWithdrawal" : false,
    "markForLiquidation" : false,

    "liquidateVault" : false,
    "borrow" : false,
    "repay" : false,

    "vaultDepositStakedToken" : false,
    "vaultWithdrawStakedToken" : false,
})

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
            name: 'MAVEN Lending Controller Contract',
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

export const lendingControllerStorage : lendingControllerStorageType = {
  
    admin                           : bob.pkh,
    metadata                        : metadata,
    config                          : config,
    
    // vaultRwaConfig                  : vaultRwaConfig,
    // breakGlassConfig                : breakGlassConfig,

    vaultConfigLedger               : vaultConfigLedger,
    breakGlassLedger                : breakGlassLedger,

    mvnTokenAddress                 : zeroAddress,
    governanceAddress               : zeroAddress,

    vaults                          : MichelsonMap.fromLiteral({}),
    ownerLedger                     : MichelsonMap.fromLiteral({}),

    collateralTokenLedger           : MichelsonMap.fromLiteral({}),
    loanTokenLedger                 : MichelsonMap.fromLiteral({}),

    lambdaLedger                    : MichelsonMap.fromLiteral({}),
    vaultLambdaLedger               : MichelsonMap.fromLiteral({}),
}