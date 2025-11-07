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
    decimals                     : nat;         // decimals used for percentage calculation
    interestRateDecimals         : nat;         // decimals used for interest rate (ray : 10^27)
    maxDecimalsForCalculation    : nat;         // max decimals to be used in calculations
    lastCompletedDataMaxDelay    : nat;         // max delay in last updated at for last completed data in fetching prices
]

type vaultConfigRecordType is [@layout:comb] record [
    collateralRatio              : nat;         // collateral ratio
    liquidationRatio             : nat;         // liquidation ratio
    
    liquidationFeePercent        : nat;         // liquidation fee percent - penalty fee paid by vault owner to liquidator
    adminLiquidationFeePercent   : nat;         // admin liquidation fee percent - penalty fee paid by vault owner to treasury
    minimumLoanFeePercent        : nat;         // minimum loan fee percent - taken at first minting

    minimumLoanFeeTreasuryShare  : nat;         // percentage of minimum loan fee that goes to the treasury
    interestTreasuryShare        : nat;         // percentage of interest that goes to the treasury

    maxVaultLiquidationPercent   : nat;         // max percentage of vault debt that can be liquidated (e.g. 50% on AAVE)
    liquidationDelayInMins       : nat;         // delay before a vault can be liquidated, after it has been marked for liquidation
    liquidationMaxDuration       : nat;         // window of opportunity (in mins) for a liquidation event to occur after a vault has been marked for liquidation

    interestRepaymentPeriod      : nat;         // period (in mins) in which vault has to repay interest in (e.g. every 30 days)
    missedPeriodsForLiquidation  : nat;         // number of missed interest repayment periods before vault can be liquidated
    repaymentWindow              : nat;         // repayment window (in mins) before fee penalty is applied if interest total did not reach zero
    penaltyFeePercentage         : nat;         // percentage of interest outstanding that will be counted as penalty fee
    liquidationConfig            : nat;         // liquidation config - 0: standard, 1: rwa - Note: not exactly the same as vault config, as there might be different liquidation mechanisms in future
]
type vaultConfigLedgerType is big_map(nat, vaultConfigRecordType);


type breakGlassLedgerType is big_map(string, bool);


type collateralTokenRecordType is [@layout:comb] record [
    tokenName               : string;
    tokenContractAddress    : address;
    tokenDecimals           : nat;      

    oracleAddress           : address;   
    protected               : bool;
    
    isScaledToken           : bool;
    isStakedToken           : bool;
    stakingContractAddress  : option(address);

    totalDeposited          : nat;
    maxDepositAmount        : option(nat);

    tokenType               : tokenType; 

    isPaused                : bool;
]
type collateralTokenLedgerType is big_map(string, collateralTokenRecordType) 


type loanTokenRecordType is [@layout:comb] record [
    
    tokenName                               : string;
    tokenType                               : tokenType; 
    tokenDecimals                           : nat;

    oracleAddress                           : address;   

    rawMTokensTotalSupply                   : nat;
    mTokenAddress                           : address;

    tokenPoolTotal                          : nat;  // sum of totalBorrowed and totalRemaining
    totalBorrowed                           : nat; 
    totalRemaining                          : nat; 

    reserveRatio                            : nat;  // percentage of token pool that should be kept as reserves for liquidity 
    utilisationRate                         : nat;
    optimalUtilisationRate                  : nat;  // kink point
    baseInterestRate                        : nat;  // base interest rate
    maxInterestRate                         : nat;  // max interest rate
    interestRateBelowOptimalUtilisation     : nat;  // interest rate below kink
    interestRateAboveOptimalUtilisation     : nat;  // interest rate above kink
    minRepaymentAmount                      : nat; 

    currentInterestRate                     : nat;
    lastUpdatedBlockLevel                   : nat; 
    tokenRewardIndex                        : nat;
    borrowIndex                             : nat;

    isPaused                                : bool;
]

type loanTokenLedgerType is big_map(string, loanTokenRecordType)


type collateralBalanceLedgerType  is map(collateralNameType, tokenBalanceType) // to keep record of token collateral (mav/token)
type vaultRecordType is [@layout:comb] record [

    address                     : address;
    collateralBalanceLedger     : collateralBalanceLedgerType;   // mav/token balance
    loanToken                   : string;                        // e.g. USDT, EURT,  
    vaultConfig                 : nat;                           // e.g. 0: standard, 1: rwa

    // loan variables
    loanOutstandingTotal        : nat;                           // total amount debt (principal + interest)
    loanPrincipalTotal          : nat;                           // total amount principal
    loanInterestTotal           : nat;                           // total amount interest
    loanDecimals                : nat;                           // should be 6 by default (USDT, EURT)
    borrowIndex                 : nat;
    
    lastUpdatedBlockLevel       : nat;                           // block level of when vault was last updated for loans payment
    lastUpdatedTimestamp        : timestamp;                     // timestamp of when vault was last updated

    markedForLiquidationLevel   : nat;                           // block level of when vault was marked for liquidation
    liquidationEndLevel         : nat;                           // block level of when vault will no longer be liquidated, or will need to be marked for liquidation again

    loanStartTimestamp          : option(timestamp);             // timestamp: for RWA-type vaults on when loan was first taken
    lastInterestCleared         : timestamp;                     // timestamp: for RWA-type vault on last interest payment cleared
    loanStartLevel              : option(nat);                   // block level: for RWA-type vaults on when loan was first taken
    lastInterestClearedLevel    : nat;                           // block level: for RWA-type vault on last interest payment cleared

    penaltyAppliedTimestamp     : option(timestamp);             // for RWA-type vault, on when penalty was last applied
    penaltyAppliedLevel         : option(nat);                   // block level: for RWA-type vault, on when penalty was last applied

    penaltyCounter              : nat;                           // for RWA-type vault, keep track of penalty counter

]


type vaultPenaltyRecordType is [@layout:comb] record [
    entrypoint                  : string;
    penaltyFee                  : nat;
    penaltyTimestamp            : timestamp;
]
type vaultPenaltyEventLedgerType is big_map((address * nat), vaultPenaltyRecordType) // vault address * penalty counter

// owner types
type ownerVaultSetType              is set(vaultIdType)                     // set of vault ids belonging to the owner 
type ownerLedgerType                is big_map(address, ownerVaultSetType)  // big map of owners, and the corresponding vaults they own

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

type addLiquidityActionType is [@layout:comb] record [
    loanTokenName  : string;
    amount         : nat;    
]


type removeLiquidityActionType is [@layout:comb] record [
    loanTokenName           : string;
    amount                  : nat;
]


type lendingControllerUpdateConfigSingleType is [@layout:comb] record [
    configName      : string;
    newValue        : nat;  
]
type lendingControllerUpdateConfigActionType is list(lendingControllerUpdateConfigSingleType)


type breakGlassSingleType is [@layout:comb] record [
    entrypoint     : string;
    pauseBool      : bool;
]
type breakGlassListType is list(breakGlassSingleType)


type registerVaultCreationActionType is [@layout:comb] record [
    vaultOwner      : vaultOwnerType;
    vaultId         : vaultIdType;
    vaultAddress    : address;
    vaultConfig     : nat;
    loanTokenName   : string;
]

type closeVaultActionType is [@layout:comb] record [
    vaultId                     : vaultIdType; 
]


type createLoanTokenActionType is [@layout:comb] record [
    tokenName                               : string;
    tokenDecimals                           : nat;

    oracleAddress                           : address;
    mTokenAddress                           : address;

    reserveRatio                            : nat;  // percentage of token pool that should be kept as reserves for liquidity 
    optimalUtilisationRate                  : nat;  // kink point
    baseInterestRate                        : nat;  // base interest rate
    maxInterestRate                         : nat;  // max interest rate
    interestRateBelowOptimalUtilisation     : nat;  // interest rate below kink
    interestRateAboveOptimalUtilisation     : nat;  // interest rate above kink
    minRepaymentAmount                      : nat; 

    // variants at the end for taquito 
    tokenType                               : tokenType; 
]


type updateLoanTokenActionType is [@layout:comb] record [

    tokenName                               : string;

    oracleAddress                           : address;

    reserveRatio                            : nat;  // percentage of token pool that should be kept as reserves for liquidity 
    optimalUtilisationRate                  : nat;  // kink point
    baseInterestRate                        : nat;  // base interest rate
    maxInterestRate                         : nat;  // max interest rate
    interestRateBelowOptimalUtilisation     : nat;  // interest rate below kink
    interestRateAboveOptimalUtilisation     : nat;  // interest rate above kink
    minRepaymentAmount                      : nat; 

    isPaused                                : bool;
]


type setVaultConfigActionType is 
    |   SetNewVaultConfig    of (nat * vaultConfigRecordType)                      // vault config id * vault config record
    |   UpdateVaultConfig    of (nat * lendingControllerUpdateConfigActionType)    // vault config id * update config list


type setLoanTokenType is 
    |   CreateLoanToken      of createLoanTokenActionType
    |   UpdateLoanToken      of updateLoanTokenActionType

type setLoanTokenActionType is [@layout:comb] record [
    action      : setLoanTokenType;
    empty       : unit;
]

type createCollateralTokenActionType is [@layout:comb] record [
    tokenName               : string;
    tokenContractAddress    : address;
    tokenDecimals           : nat; 

    oracleAddress           : address;   
    protected               : bool;
    
    isScaledToken           : bool;
    isStakedToken           : bool;
    stakingContractAddress  : option(address);

    maxDepositAmount        : option(nat);

    // variants at the end for taquito 
    tokenType               : tokenType; 
]


type updateCollateralTokenActionType is [@layout:comb] record [
    tokenName               : string;
    oracleAddress           : address;   
    isPaused                : bool;
    stakingContractAddress  : option(address);
    maxDepositAmount        : option(nat);
]


type setCollateralTokenType is 
    |   CreateCollateralToken      of createCollateralTokenActionType
    |   UpdateCollateralToken      of updateCollateralTokenActionType

type setCollateralTokenActionType is [@layout:comb] record [
    action      : setCollateralTokenType;
    empty       : unit;
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


type markForLiquidationActionType is [@layout:comb] record [
    vaultId     : nat;
    vaultOwner  : address;
]


type liquidateVaultActionType is [@layout:comb] record [
    vaultId     : nat;
    vaultOwner  : address;
    amount      : nat;
]

type liquidateRwaVaultActionType is [@layout:comb] record [
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
    vaultOwner  : address; 
    quantity    : nat;
]


type vaultDepositStakedTokenActionType is [@layout:comb] record [
    tokenName       : string;
    vaultId         : nat;
    depositAmount   : nat;
]


type vaultWithdrawStakedTokenActionType is [@layout:comb] record [
    tokenName       : string;
    vaultId         : nat;
    withdrawAmount  : nat;
]


type claimRewardsType is address


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------

type lendingControllerLambdaActionType is 
        
        // Housekeeping Entrypoints
    |   LambdaSetAdmin                        of (address)
    |   LambdaSetGovernance                   of (address)
    |   LambdaUpdateConfig                    of lendingControllerUpdateConfigActionType

        // Pause / Break Glass Lambdas
    |   LambdaTogglePauseEntrypoint           of breakGlassListType

        // Admin Entrypoints
    |   LambdaSetVaultConfig                  of setVaultConfigActionType  
    |   LambdaSetLoanToken                    of setLoanTokenActionType  
    |   LambdaSetCollateralToken              of setCollateralTokenActionType  
    |   LambdaRegisterVaultCreation           of registerVaultCreationActionType

        // Token Pool Entrypoints
    |   LambdaAddLiquidity                    of addLiquidityActionType
    |   LambdaRemoveLiquidity                 of removeLiquidityActionType

        // Vault Entrypoints
    |   LambdaCloseVault                      of closeVaultActionType
    |   LambdaMarkForLiquidation              of markForLiquidationActionType
    |   LambdaLiquidateVault                  of liquidateVaultActionType
    |   LambdaRegisterWithdrawal              of registerWithdrawalActionType
    |   LambdaRegisterDeposit                 of registerDepositActionType
    |   LambdaBorrow                          of borrowActionType
    |   LambdaRepay                           of repayActionType

        // Vault Staked Token Entrypoints   
    |   LambdaVaultDepositStakedToken         of vaultDepositStakedTokenActionType
    |   LambdaVaultWithdrawStakedToken        of vaultWithdrawStakedTokenActionType

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type lendingControllerStorageType is [@layout:comb] record [

    admin                       : address;
    metadata                    : metadataType;
    config                      : lendingControllerConfigType;
    breakGlassLedger            : breakGlassLedgerType;
    vaultConfigLedger           : vaultConfigLedgerType;

    mvnTokenAddress             : address;
    governanceAddress           : address;
    
    // vaults and owners
    vaults                      : big_map(vaultHandleType, vaultRecordType);
    ownerLedger                 : ownerLedgerType;  // for some convenience in checking vaults owned by user
    vaultPenaltyEventLedger     : vaultPenaltyEventLedgerType;

    // collateral tokens
    collateralTokenLedger       : collateralTokenLedgerType;
    loanTokenLedger             : loanTokenLedgerType;

    // lambdas
    lambdaLedger                : lambdaLedgerType;

]