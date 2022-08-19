// Doorman Types
#include "../contractTypes/doormanTypes.ligo"

// Vault Types
#include "../contractTypes/vaultTypes.ligo"

// ------------------------------------------------------------------------------
// Basic Types
// ------------------------------------------------------------------------------

type vaultIdType                 is nat;
type tokenBalanceType            is nat;

type vaultOwnerType              is address;
type initiatorAddressType        is address;
type tokenContractAddressType    is address;

type collateralNameType          is string;

// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type lendingControllerConfigType is [@layout:comb] record [
    
    collateralRatio              : nat;        // collateral ratio
    liquidationRatio             : nat;        // liquidation ratio
    
    liquidationFeePercent        : nat;        // liquidation fee percent - penalty fee paid by vault owner to liquidator
    adminLiquidationFeePercent   : nat;        // admin liquidation fee percent - penalty fee paid by vault owner to treasury

    minimumLoanFeePercent        : nat;        // minimum loan fee percent - taken at first minting

    minimumLoanFeeTreasuryShare  : nat;     // percentage of minimum loan fee that goes to the treasury
    interestTreasuryShare        : nat;     // percentage of interest that goes to the treasury

    decimals                     : nat;     // decimals used for percentage calculation
    maxDecimalsForCalculation    : nat;     // max decimals to be used in calculations

    maxVaultLiquidationPercent   : nat;     // max percentage of vault debt that can be liquidated (e.g. 50% for AAVE)
    liquidationDelayInMins       : nat;     // delay before a vault can be liquidated, after it has been marked for liquidation

]

type lendingControllerBreakGlassConfigType is record [
    
    // Lending Controller Vault Entrypoints
    createVaultIsPaused                 : bool; 
    closeVaultIsPaused                  : bool;
    registerDepositIsPaused             : bool;
    registerWithdrawalIsPaused          : bool;
    liquidateVaultIsPaused              : bool;
    borrowIsPaused                      : bool;
    repayIsPaused                       : bool;

    // Vault Staked MVK Entrypoints
    vaultDepositStakedMvkIsPaused       : bool;
    vaultWithdrawStakedMvkIsPaused      : bool;
    vaultLiquidateStakedMvkIsPaused     : bool;

    // Vault Entrypoints
    vaultDelegateTezToBakerIsPaused         : bool; 
    vaultDelegateMvkToSatelliteIsPaused     : bool;
    vaultWithdrawIsPaused                   : bool;
    vaultDepositIsPaused                    : bool;
    vaultEditDepositorIsPaused              : bool;

]

type rewardsRecordType is [@layout:comb] record[
    unpaid            : nat;
    paid              : nat;
    rewardsPerShare   : nat;    
]
type rewardsLedgerType is big_map((address * string), rewardsRecordType)        // key - user address and token name e.g. USDT, EURL

type depositorLedgerType is big_map((address * string), nat)   // key - user address and token name e.g. USDT, EURL, value - amount


type collateralTokenRecordType is [@layout:comb] record [
    tokenName               : string;
    tokenContractAddress    : address;
    decimals                : nat;       // token decimals

    oracleType              : string;    // "CFMM", "ORACLE" - use string instead of variant in case of future changes
    oracleAddress           : address;   // zeroAddress if no oracle

    tokenType               : tokenType; 
]
type collateralTokenLedgerType is map(string, collateralTokenRecordType) 


type loanTokenRecordType is [@layout:comb] record [
    
    tokenName                               : string;
    tokenType                               : tokenType; 
    decimals                                : nat;

    lpTokensTotal                           : nat;
    lpTokenContractAddress                  : address;
    lpTokenId                               : nat;

    reserveRatio                            : nat;  // percentage of token pool that should be kept as reserves for liquidity 
    tokenPoolTotal                          : nat;  // sum of totalBorrowed and totalRemaining
    totalBorrowed                           : nat; 
    totalRemaining                          : nat; 

    utilisationRate                         : nat;
    optimalUtilisationRate                  : nat;  // kink point
    baseInterestRate                        : nat;  // base interest rate
    maxInterestRate                         : nat;  // max interest rate
    interestRateBelowOptimalUtilisation     : nat;  // interest rate below kink
    interestRateAboveOptimalUtilisation     : nat;  // interest rate above kink

    currentInterestRate                     : nat;

    lastUpdatedBlockLevel                   : nat; 

    accumulatedRewardsPerShare              : nat;
    
    borrowIndex                             : nat;
]

type loanTokenLedgerType is big_map(string, loanTokenRecordType)


type collateralBalanceLedgerType  is map(collateralNameType, tokenBalanceType) // to keep record of token collateral (tez/token)
type vaultRecordType is [@layout:comb] record [

    address                     : address;
    collateralBalanceLedger     : collateralBalanceLedgerType;   // tez/token balance
    loanToken                   : string;                        // e.g. USDT, EURL,  

    // loan variables
    loanOutstandingTotal        : nat;                           // total amount debt (principal + interest)
    loanPrincipalTotal          : nat;                           // total amount principal
    loanInterestTotal           : nat;                           // total amount interest
    loanDecimals                : nat;                           // should be 6 by default (USDT, EURL)
    borrowIndex                 : nat;
    
    lastUpdatedBlockLevel       : nat;                           // block level of when vault was last updated for loans payment
    lastUpdatedTimestamp        : timestamp;                     // timestamp of when vault was last updated
    
]

// owner types
type ownerVaultSetType              is set(vaultIdType)                     // set of vault ids belonging to the owner 
type ownerLedgerType                is big_map(address, ownerVaultSetType)  // big map of owners, and the corresponding vaults they own

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

type mintOrBurnParamsType is [@layout:comb] record [
    quantity  : int;
    target    : address;
];

(* Mint entrypoint inputs *)
type mintParamsType is (address * tokenBalanceType)

(* Burn entrypoint inputs *)
type burnParamsType is (address * tokenBalanceType)


type addLiquidityActionType is [@layout:comb] record [
    loanTokenName  : string;
    amount         : nat;    
]


type removeLiquidityActionType is [@layout:comb] record [
    loanTokenName           : string;
    amount                  : nat;
]


type lendingControllerUpdateConfigNewValueType is nat
type lendingControllerUpdateConfigActionType is 
        
        ConfigCollateralRatio           of unit
    |   ConfigLiquidationRatio          of unit
    |   ConfigLiquidationFeePercent     of unit
    |   ConfigAdminLiquidationFee       of unit
    |   ConfigMinimumLoanFeePercent     of unit
    |   ConfigMinLoanFeeTreasuryShare   of unit
    |   ConfiginterestTreasuryShare     of unit

type lendingControllerUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : lendingControllerUpdateConfigNewValueType;  
    updateConfigAction      : lendingControllerUpdateConfigActionType;
]


type updateVaultTokenAddressesActionType is [@layout:comb] record [
    handle                      : vaultHandleType; 
]

type depositorsType is
  | Whitelist of set(address)
  | Any       

type createVaultActionType is [@layout:comb] record [
    delegate                    : option(key_hash); 
    metadata                    : bytes;
    loanTokenName               : string;            // use string, not variant, to account for future loan types using the same controller contract
    depositors                  : depositorsType;
]


type closeVaultActionType is [@layout:comb] record [
    vaultId                     : vaultIdType; 
]


type setLoanTokenActionType is [@layout:comb] record [
    tokenName                               : string;
    decimals                                : nat;

    lpTokenContractAddress                  : address;
    lpTokenId                               : nat;

    reserveRatio                            : nat;  // percentage of token pool that should be kept as reserves for liquidity 
    
    optimalUtilisationRate                  : nat;  // kink point
    baseInterestRate                        : nat;  // base interest rate
    maxInterestRate                         : nat;  // max interest rate
    interestRateBelowOptimalUtilisation     : nat;  // interest rate below kink
    interestRateAboveOptimalUtilisation     : nat;  // interest rate above kink

    // variants at the end for taquito 
    tokenType                               : tokenType; 
]


type updateCollateralTokenActionType is [@layout:comb] record [

    tokenName               : string;
    tokenContractAddress    : address;
    decimals                : nat; 

    oracleType              : string;    // "CFMM", "ORACLE" - use string instead of variant in case of future changes
    oracleAddress           : address;   // zeroAddress if no oracle

    // variants at the end for taquito 
    tokenType               : tokenType; 

]


type registerWithdrawalActionType is [@layout:comb] record [
    handle         : vaultHandleType; 
    amount         : nat;  
    tokenName      : string;
]


type registerDepositActionType is [@layout:comb] record [
    handle      : vaultHandleType; 
    amount      : nat;
    tokenName   : string;
]


type liquidateVaultActionType is [@layout:comb] record [
    vaultId     : nat;
    vaultOwner  : address;
    amount      : nat;
]


type borrowActionType is [@layout:comb] record [ 
    vaultId     : nat; 
    quantity    : nat;
]


type repayActionType is [@layout:comb] record [ 
    vaultId     : nat; 
    quantity    : nat;
]


type vaultCallbackActionType is [@layout:comb] record [ 
    vaultId             : nat;
    quantity            : nat;
    initiator           : address;
    tokenBorrowIndex    : nat;
]

type updateTokenPoolCallbackActionType is [@layout:comb] record [
    
    tokenName       : string;
    callback        : contract(vaultCallbackActionType);

    // pass on to callback
    vaultId         : nat;  
    quantity        : nat;
    initiator       : address;

]

type updateRewardsActionType is [@layout:comb] record [
    tokenName       : string;
    amount          : nat;
]

type vaultDepositStakedMvkType is [@layout:comb] record [
    vaultId         : nat;
    depositAmount   : nat;
]

type vaultWithdrawStakedMvkType is [@layout:comb] record [
    vaultId         : nat;
    withdrawAmount  : nat;
]

type vaultLiquidateStakedMvkType is [@layout:comb] record [
    vaultId           : nat;
    vaultOwner        : address;
    liquidator        : address;
    liquidatedAmount  : nat;
]


type lendingControllerPausableEntrypointType is

        // Lending Controller Vault Entrypoints
        CreateVault                 of bool
    |   CloseVault                  of bool
    |   RegisterWithdrawal          of bool
    |   RegisterDeposit             of bool
    |   LiquidateVault              of bool
    |   Borrow                      of bool
    |   Repay                       of bool

        // Vault Staked MVK Entrypoints
    |   VaultDepositStakedMvk       of bool
    |   VaultWithdrawStakedMvk      of bool
    |   VaultLiquidateStakedMvk     of bool

        // Vault Entrypoints
    |   VaultDelegateTezToBaker     of bool
    |   VaultDelegateMvkToSatellite of bool
    |   VaultWithdraw               of bool
    |   VaultDeposit                of bool
    |   VaultEditDepositor          of bool

type lendingControllerTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : lendingControllerPausableEntrypointType;
    empty             : unit
];


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type lendingControllerLambdaActionType is 
        
        // Housekeeping Entrypoints
    |   LambdaSetAdmin                        of (address)
    |   LambdaSetGovernance                   of (address)
    |   LambdaUpdateMetadata                  of updateMetadataType
    |   LambdaUpdateConfig                    of lendingControllerUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts        of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts          of updateGeneralContractsType
    |   LambdaUpdateWhitelistTokens           of updateWhitelistTokenContractsType

        // Pause / Break Glass Lambdas
    |   LambdaPauseAll                        of (unit)
    |   LambdaUnpauseAll                      of (unit)
    |   LambdaTogglePauseEntrypoint           of lendingControllerTogglePauseEntrypointType

        // Token Pool Entrypoints
    |   LambdaSetLoanToken                    of setLoanTokenActionType  
    |   LambdaAddLiquidity                    of addLiquidityActionType
    |   LambdaRemoveLiquidity                 of removeLiquidityActionType

        // Vault Entrypoints
    |   LambdaUpdateCollateralToken           of updateCollateralTokenActionType  
    |   LambdaCreateVault                     of createVaultActionType
    |   LambdaCloseVault                      of closeVaultActionType
    |   LambdaLiquidateVault                  of liquidateVaultActionType
    |   LambdaRegisterWithdrawal              of registerWithdrawalActionType
    |   LambdaRegisterDeposit                 of registerDepositActionType
    |   LambdaBorrow                          of borrowActionType
    |   LambdaRepay                           of repayActionType

        // Vault Staked MVK Entrypoints   
    |   LambdaVaultDepositStakedMvk           of vaultDepositStakedMvkType   
    |   LambdaVaultWithdrawStakedMvk          of vaultWithdrawStakedMvkType   
    |   LambdaVaultLiquidateStakedMvk         of vaultLiquidateStakedMvkType   


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type lendingControllerStorageType is [@layout:comb] record [

    admin                       : address;
    metadata                    : metadataType;
    config                      : lendingControllerConfigType;
    breakGlassConfig            : lendingControllerBreakGlassConfigType;

    mvkTokenAddress             : address;
    governanceAddress           : address;
    
    whitelistContracts          : whitelistContractsType;       // can be used for vaults whitelist contracts as well
    generalContracts            : generalContractsType;
    whitelistTokenContracts     : whitelistTokenContractsType;      

    // token pool
    rewardsLedger               : rewardsLedgerType;
    depositorLedger             : depositorLedgerType;

    // vaults and owners
    vaults                      : big_map(vaultHandleType, vaultRecordType);
    vaultCounter                : nat;      
    ownerLedger                 : ownerLedgerType;              // for some convenience in checking vaults owned by user

    // collateral tokens
    collateralTokenLedger       : collateralTokenLedgerType;
    loanTokenLedger             : loanTokenLedgerType;

    // lambdas
    lambdaLedger                : lambdaLedgerType;
    vaultLambdaLedger           : lambdaLedgerType;

]