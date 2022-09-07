import { MichelsonMap } from "@taquito/michelson-encoder"

import { BigNumber } from "bignumber.js"

const { alice, bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils"

import { lendingControllerMockTimeStorageType } from "../test/types/lendingControllerMockTimeStorageType"

const config = {

    collateralRatio             : 2000,    // collateral ratio (%)
    liquidationRatio            : 1500,    // liquidation ratio (%)

    liquidationFeePercent       : 600,
    adminLiquidationFeePercent  : 600,

    minimumLoanFeePercent       : 100,

    minimumLoanFeeTreasuryShare : 4000,
    interestTreasuryShare       : 100,

    decimals                    : 4,       // decimals 
    interestRateDecimals        : 27,      // interest rate decimals
    maxDecimalsForCalculation   : 32,

    maxVaultLiquidationPercent  : 500,
    liquidationDelayInMins      : 120,

    mockLevel                   : 0
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

    // Vault Staked MVK Entrypoints
    vaultDepositStakedMvkIsPaused       : false,
    vaultWithdrawStakedMvkIsPaused      : false,
    vaultLiquidateStakedMvkIsPaused     : false,

    // Reward Entrypoints
    claimRewardsIsPaused     : false,
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

const usdtTokenType = {
    fa2 : {
        tokenContractAddress : zeroAddress,
        tokenId : 0
    }
}
const usdtRecord = {
    tokenName                   : "usdt",
    tokenContractAddress        : zeroAddress,
    tokenType                   : usdtTokenType, 
    tokenId                     : 0,
    tokenDecimals               : 6,

    lpTokensTotal               : 0,
    lpTokenContractAddress      : zeroAddress,
    lpTokenId                   : 0,

    reserveRatio                : 30,  // percentage of token pool that should be kept as reserves for liquidity 
    tokenPoolTotal              : 0,  // sum of totalBorrowed and totalRemaining
    totalBorrowed               : 0,
    totalRemaining              : 0,

    utilisationRate                         : 0,
    optimalUtilisationRate                  : 30,  // kink point
    baseInterestRate                        : 10,  // base interest rate
    maxInterestRate                         : 20,  // max interest rate
    interestRateBelowOptimalUtilisation     : 10,  // interest rate below kink
    interestRateAboveOptimalUtilisation     : 20,  // interest rate above kink

    currentInterestRate         : 1,

    lastUpdatedBlockLevel       : 0,

    accumulatedRewardsPerShare  : 1,
    borrowIndex                 : 1
}

const loanTokenLedger = MichelsonMap.fromLiteral({
    "usdt" : usdtRecord
})


export const lendingControllerMockTimeStorage : lendingControllerMockTimeStorageType = {
  
    admin                           : bob.pkh,
    tester                          : bob.pkh,
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
    ownerLedger                     : MichelsonMap.fromLiteral({}),

    collateralTokenLedger           : MichelsonMap.fromLiteral({}),
    loanTokenLedger                 : loanTokenLedger,

    lambdaLedger                    : MichelsonMap.fromLiteral({}),
    vaultLambdaLedger               : MichelsonMap.fromLiteral({}),

    tempMap                         : MichelsonMap.fromLiteral({}),
}