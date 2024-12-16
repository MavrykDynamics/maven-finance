import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"
import { bob } from '../scripts/sandbox/accounts'
import { zeroAddress } from "../test/helpers/Utils"
import { lendingControllerMockTimeStorageType } from "./storageTypes/lendingControllerMockTimeStorageType"

const config = {
    decimals                    : 4,       // decimals 
    interestRateDecimals        : 27,      // interest rate decimals
    maxDecimalsForCalculation   : 32,
    lastCompletedDataMaxDelay   : 9999999999, // for testing purposes - prod: 300 (i.e. 5 mins) 
    mockLevel                   : 0
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
    repaymentWindow              : 0,    
    penaltyFeePercentage         : 0,    
    liquidationConfig            : 0
}

const vaultRwaConfig = {
    collateralRatio             : 2000,    // collateral ratio (%)
    liquidationRatio            : 1500,    // liquidation ratio (%)

    liquidationFeePercent       : 300,
    adminLiquidationFeePercent  : 300,
    minimumLoanFeePercent       : 300,

    minimumLoanFeeTreasuryShare : 4000,
    interestTreasuryShare       : 100,

    maxVaultLiquidationPercent  : 5000,    // 50%      
    liquidationDelayInMins      : 120,
    liquidationMaxDuration      : 1440,

    interestRepaymentPeriod      : 30 * 1440, // in minutes
    missedPeriodsForLiquidation  : 4,
    repaymentWindow              : 1440 * 7,  // in minutes  
    penaltyFeePercentage         : 10,    
    liquidationConfig            : 1
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

    "setCollateralToken" : false,
    "createVault" : false,
    "closeVault" : false,
    "registerDeposit" : false,
    "registerWithdrawal" : false,
    "markForLiquidation" : false,

    "registerVaultCreation": false,
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
        name: 'Maven Finance - Lending Controller',
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
            location: "https://github.com/MavrykDynamics/maven-finance"
        },
        interfaces: [ 'MIP-16' ],
        }),
        'ascii',
    ).toString('hex'),
})

export const lendingControllerMockTimeStorage : lendingControllerMockTimeStorageType = {
  
    admin                           : bob.pkh,
    tester                          : bob.pkh,
    metadata                        : metadata,
    config                          : config,

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
    vaultPenaltyEventLedger         : MichelsonMap.fromLiteral({}),

    tempBoolMap                     : MichelsonMap.fromLiteral({}),
}