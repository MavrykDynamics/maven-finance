// Doorman Types
#include "../contractTypes/doormanTypes.ligo"

// ------------------------------------------------------------------------------
// Basic Types
// ------------------------------------------------------------------------------


type vaultIdType                 is nat;
type usdmAmountType              is nat;
type tokenBalanceType            is nat;

type vaultOwnerType              is address;
type initiatorAddressType        is address;
type tokenContractAddressType    is address;

type collateralNameType          is string;

// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type lendingControllerConfigType is [@layout:comb] record [
    
    collateralRatio           : nat;    // collateral ratio
    liquidationRatio          : nat;    // liquidation ratio
    
    liquidationFee            : nat;    // liquidation fee - penalty fee paid by vault owner to liquidator
    adminLiquidationFee       : nat;    // admin liquidation fee - penalty fee paid by vault owner to treasury

    minimumLoanFee            : nat;    // minimum loan fee - taken at first minting

    minimumLoanFeeTreasuryShare  : nat;  // percentage of minimum loan fee that goes to the treasury
    interestTreasuryShare        : nat;  // percentage of interest that goes to the treasury


    // annualServiceLoanFee      : nat;    // annual service loan fee - compounding over time    
    // dailyServiceLoanFee       : nat;    // daily service loan fee - compounding over time (annualServiceLoanFee / 365)

    decimals                  : nat;    // decimals used for percentage calculation

]

type lendingControllerBreakGlassConfigType is record [
    
    // Vault Entrypoints
    createVaultIsPaused                 : bool; 
    closeVaultIsPaused                  : bool;
    withdrawFromVaultIsPaused           : bool;
    registerDepositIsPaused             : bool;
    liquidateVaultIsPaused              : bool;
    borrowIsPaused                      : bool;
    repayIsPaused                       : bool;

    // Vault Staked MVK Entrypoints
    vaultDepositStakedMvkIsPaused       : bool;
    vaultWithdrawStakedMvkIsPaused      : bool;
    vaultLiquidateStakedMvkIsPaused     : bool;

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
    tokenType               : tokenType; 
    decimals                : nat; 
    oracleType              : string;    // "CFMM", "ORACLE" - use string instead of variant in case of future changes
    oracleAddress           : address;   // zeroAddress if no oracle

]
type collateralTokenLedgerType is map(string, collateralTokenRecordType) 


type loanTokenRecordType is [@layout:comb] record [
    
    tokenName                   : string;
    tokenContractAddress        : address;
    tokenType                   : tokenType; 
    tokenId                     : nat;

    lpTokensTotal               : nat;
    lpTokenContractAddress      : address;
    lpTokenId                   : nat;

    reserveRatio                : nat;  // percentage of token pool that should be kept as reserves for liquidity 
    tokenPoolTotal              : nat;  // sum of totalBorrowed and totalRemaining
    totalBorrowed               : nat; 
    totalRemaining              : nat; 

    utilisationRate                         : nat;
    optimalUtilisationRate                  : nat;  // kink point
    baseInterestRate                        : nat;  // base interest rate
    maxInterestRate                         : nat;  // max interest rate
    interestRateBelowOptimalUtilisation     : nat;  // interest rate below kink
    interestRateAboveOptimalUtilisation     : nat;  // interest rate above kink

    currentInterestRate         : nat;

    lastUpdatedBlockLevel       : nat; 

    accumulatedRewardsPerShare  : nat;
    
    borrowIndex                 : nat;
]

type loanTokenLedgerType is big_map(string, loanTokenRecordType)


// type loanTokenRecordType is [@layout:comb] record [
//     tokenContractAddress    : address;
//     tokenType               : tokenType; 
//     decimals                : nat; 
// ]
// type loanTokenLedgerType is big_map(string, loanTokenRecordType)



type collateralBalanceLedgerType  is map(collateralNameType, tokenBalanceType) // to keep record of token collateral (tez/token)
type vaultRecordType is [@layout:comb] record [

    address                     : address;
    collateralBalanceLedger     : collateralBalanceLedgerType;   // tez/token balance
    loanToken                   : string;                        // e.g. USDT, EURL,  

    // loan variables
    loanOutstandingTotal        : nat;                           // total amount debt (principal + interest)
    loanPrincipalTotal          : nat;                           // total amount principal
    loanInterestTotal           : nat;                           // total amount interest
    borrowIndex                 : nat;
    
    lastUpdatedBlockLevel       : nat;                           // block level of when vault was last updated for loans payment
    lastUpdatedTimestamp        : timestamp;                     // timestamp of when vault was last updated
    

]

// owner types
type ownerVaultSetType              is set(vaultIdType)                     // set of vault ids belonging to the owner 
type ownerLedgerType                is big_map(address, ownerVaultSetType)  // big map of owners, and the corresponding vaults they own
type vaultLedgerType                is big_map(vaultIdType, bool);

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

type mintOrBurnParamsType is [@layout:comb] record [
    quantity  : int;
    target    : address;
];


type addLiquidityActionType is [@layout:comb] record [
    tokenName               : string;
    tokensDeposited         : nat;
    owner                   : address;
]


type removeLiquidityActionType is [@layout:comb] record [
    lpTokensBurned          : nat;
    tokenName               : string;
    tokensWithdrawn         : nat;
    [@annot:to] to_         : address;
]


type lendingControllerUpdateConfigNewValueType is nat
type lendingControllerUpdateConfigActionType is 
        
        ConfigCollateralRatio           of unit
    |   ConfigLiquidationRatio          of unit
    |   ConfigLiquidationFee            of unit
    |   ConfigAdminLiquidationFee       of unit
    |   ConfigMinimumLoanFee            of unit
    |   ConfigAnnualServiceLoanFee      of unit
    |   ConfigDailyServiceLoanFee       of unit
    |   ConfigDecimals                  of unit

type lendingControllerUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : lendingControllerUpdateConfigNewValueType; 
    updateConfigAction      : lendingControllerUpdateConfigActionType;
]


type updateCollateralTokenLedgerActionType is [@layout:comb] record [
    tokenName                   : string;
    tokenContractAddress        : address;
    tokenType                   : tokenType;
    decimals                    : nat;
    oracleType                  : string;
    oracleAddress               : address;
]


type updateVaultTokenAddressesActionType is [@layout:comb] record [
    handle                      : vaultHandleType; 
]


type createVaultActionType is [@layout:comb] record [
    delegate                    : option(key_hash); 
    depositors                  : depositorsType;
    loanTokenName               : string;            // use string, not variant, to account for future loan types using the same controller contract
]


type closeVaultActionType is [@layout:comb] record [
    vaultId                     : vaultIdType; 
]


type withdrawFromVaultActionType is [@layout:comb] record [
    id                          : vaultIdType; 
    tokenAmount                 : nat;  
    tokenName                   : string;
    // [@annot:to] to_             : contract(unit);
]


type registerDepositType is [@layout:comb] record [
    handle      : vaultHandleType; 
    amount      : nat;
    tokenName   : string;
]


type liquidateVaultActionType is [@layout:comb] record [
    handle                      : vaultHandleType; 
    loanQuantity                : nat; 
    loanToken                   : string;
    [@annot:to] to_             : contract(unit);
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

type lendingControllerPausableEntrypointType is

        // Vault Entrypoints
        CreateVault                 of bool
    |   CloseVault                  of bool
    |   WithdrawFromVault           of bool
    |   RegisterDeposit             of bool
    |   LiquidateVault              of bool
    |   Borrow                      of bool
    |   Repay                       of bool

        // Vault Staked MVK Entrypoints
    |   VaultDepositStakedMvk       of bool
    |   VaultWithdrawStakedMvk      of bool
    |   VaultLiquidateStakedMvk     of bool

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
    |   LambdaUpdateCollateralTokens          of updateCollateralTokenLedgerActionType

        // Pause / Break Glass Lambdas
    |   LambdaPauseAll                        of (unit)
    |   LambdaUnpauseAll                      of (unit)
    |   LambdaTogglePauseEntrypoint           of lendingControllerTogglePauseEntrypointType

        // Token Pool Entrypoints
    |   LambdaAddLiquidity                    of addLiquidityActionType
    |   LambdaRemoveLiquidity                 of removeLiquidityActionType

        // Vault Entrypoints
    |   LambdaCreateVault                     of createVaultActionType
    |   LambdaCloseVault                      of closeVaultActionType
    |   LambdaLiquidateVault                  of liquidateVaultActionType
    |   LambdaWithdrawFromVault               of withdrawFromVaultActionType
    |   LambdaRegisterDeposit                 of registerDepositType
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
    
    whitelistContracts          : whitelistContractsType;
    generalContracts            : generalContractsType;
    whitelistTokenContracts     : whitelistTokenContractsType;      

    // token pool
    rewardsLedger               : rewardsLedgerType;
    depositorLedger             : depositorLedgerType;

    // vaults and owners
    vaults                      : big_map(vaultHandleType, vaultRecordType);
    vaultCounter                : vaultIdType;      // nat
    vaultLedger                 : vaultLedgerType;  // used to check if vault id is in use already
    ownerLedger                 : ownerLedgerType;  // for some convenience in checking vaults owned by user

    // collateral tokens
    collateralTokenLedger       : collateralTokenLedgerType;
    loanTokenLedger             : loanTokenLedgerType;

    // lambdas
    lambdaLedger                : lambdaLedgerType;
    vaultLambdaLedger           : lambdaLedgerType;

    tempValue                   : nat;

]