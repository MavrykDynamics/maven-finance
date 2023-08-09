import { MichelsonMap } from "@taquito/michelson-encoder"
import { BigNumber } from "bignumber.js"
import { bob } from '../scripts/sandbox/accounts'
import { zeroAddress } from "../test/helpers/Utils"
import { lendingControllerStorageType } from "./storageTypes/lendingControllerStorageType"

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
    lastCompletedDataMaxDelay   : 300,

    maxVaultLiquidationPercent  : 5000,    // 50%      
    liquidationDelayInMins      : 120,
    liquidationMaxDuration      : 1440
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

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
            name: 'MAVRYK Lending Controller Contract',
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
    
    vaults                          : MichelsonMap.fromLiteral({}),
    vaultCounter                    : new BigNumber(1),
    ownerLedger                     : MichelsonMap.fromLiteral({}),

    collateralTokenLedger           : MichelsonMap.fromLiteral({}),
    loanTokenLedger                 : MichelsonMap.fromLiteral({}),

    lambdaLedger                    : MichelsonMap.fromLiteral({}),
    vaultLambdaLedger               : MichelsonMap.fromLiteral({}),
}