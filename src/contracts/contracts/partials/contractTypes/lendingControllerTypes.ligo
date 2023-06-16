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
    
    collateralRatio              : nat;         // collateral ratio
    liquidationRatio             : nat;         // liquidation ratio
    
    liquidationFeePercent        : nat;         // liquidation fee percent - penalty fee paid by vault owner to liquidator
    adminLiquidationFeePercent   : nat;         // admin liquidation fee percent - penalty fee paid by vault owner to treasury

    minimumLoanFeePercent        : nat;         // minimum loan fee percent - taken at first minting

    minimumLoanFeeTreasuryShare  : nat;         // percentage of minimum loan fee that goes to the treasury
    interestTreasuryShare        : nat;         // percentage of interest that goes to the treasury

    decimals                     : nat;         // decimals used for percentage calculation
    interestRateDecimals         : nat;         // decimals used for interest rate (ray : 10^27)
    maxDecimalsForCalculation    : nat;         // max decimals to be used in calculations

    maxVaultLiquidationPercent   : nat;         // max percentage of vault debt that can be liquidated (e.g. 50% for AAVE)
    liquidationDelayInMins       : nat;         // delay before a vault can be liquidated, after it has been marked for liquidation
    liquidationMaxDuration       : nat;         // window of opportunity for a liquidation event to occur after a vault has been marked for liquidation

]

type lendingControllerBreakGlassConfigType is record [
    
    // Lending Controller Admin Entrypoints
    setLoanTokenIsPaused                : bool;
    setCollateralTokenIsPaused          : bool;
    registerVaultCreationIsPaused       : bool; 

    // Lending Controller Token Pool Entrypoints
    addLiquidityIsPaused                : bool;
    removeLiquidityIsPaused             : bool;

    // Lending Controller Vault Entrypoints
    closeVaultIsPaused                  : bool;
    registerDepositIsPaused             : bool;
    registerWithdrawalIsPaused          : bool;
    markForLiquidationIsPaused          : bool;
    liquidateVaultIsPaused              : bool;
    borrowIsPaused                      : bool;
    repayIsPaused                       : bool;

    // Vault Entrypoints
    vaultDepositIsPaused                : bool;
    vaultWithdrawIsPaused               : bool;
    vaultOnLiquidateIsPaused            : bool;

    // Vault Staked Token Entrypoints
    vaultDepositStakedTokenIsPaused     : bool;
    vaultWithdrawStakedTokenIsPaused    : bool;

]


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

    rawMTokensTotalSupply                            : nat;
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

    markedForLiquidationLevel   : nat;                           // block level of when vault was marked for liquidation
    liquidationEndLevel         : nat;                           // block level of when vault will no longer be liquidated, or will need to be marked for liquidation again
    
]

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


type lendingControllerUpdateConfigNewValueType is nat
type lendingControllerUpdateConfigActionType is 
        ConfigCollateralRatio           of unit
    |   ConfigLiquidationRatio          of unit
    |   ConfigLiquidationFeePercent     of unit
    |   ConfigAdminLiquidationFee       of unit
    |   ConfigMinimumLoanFeePercent     of unit
    |   ConfigMinLoanFeeTreasuryShare   of unit
    |   ConfigInterestTreasuryShare     of unit

type lendingControllerUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : lendingControllerUpdateConfigNewValueType;  
    updateConfigAction      : lendingControllerUpdateConfigActionType;
]

type registerVaultCreationActionType is [@layout:comb] record [
    vaultOwner      : vaultOwnerType;
    vaultId         : vaultIdType;
    vaultAddress    : address;
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


type borrowActionType is [@layout:comb] record [ 
    vaultId     : nat; 
    quantity    : nat;
]


type repayActionType is [@layout:comb] record [ 
    vaultId     : nat; 
    quantity    : nat;
]


type updateRewardsActionType is [@layout:comb] record [
    tokenName       : string;
    amount          : nat;
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


type lendingControllerPausableEntrypointType is

        // Lending Controller Admin Entrypoints
    |   SetLoanToken                of bool
    |   SetCollateralToken          of bool

        // Lending Controller Token Pool Entrypoints
    |   AddLiquidity                of bool
    |   RemoveLiquidity             of bool

        // Lending Controller Vault Entrypoints
    |   RegisterVaultCreation       of bool
    |   CloseVault                  of bool
    |   RegisterDeposit             of bool
    |   RegisterWithdrawal          of bool
    |   MarkForLiquidation          of bool
    |   LiquidateVault              of bool
    |   Borrow                      of bool
    |   Repay                       of bool

        // Vault Entrypoints
    |   VaultDeposit                of bool
    |   VaultWithdraw               of bool
    |   VaultOnLiquidate            of bool

        // Vault Staked Token Entrypoints
    |   VaultDepositStakedToken     of bool
    |   VaultWithdrawStakedToken    of bool

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
    |   LambdaUpdateConfig                    of lendingControllerUpdateConfigParamsType
    |   LambdaUpdateWhitelistTokens           of updateWhitelistTokenContractsType

        // Pause / Break Glass Lambdas
    |   LambdaPauseAll                        of (unit)
    |   LambdaUnpauseAll                      of (unit)
    |   LambdaTogglePauseEntrypoint           of lendingControllerTogglePauseEntrypointType

        // Admin Entrypoints
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
    breakGlassConfig            : lendingControllerBreakGlassConfigType;

    mvkTokenAddress             : address;
    governanceAddress           : address;
    
    whitelistContracts          : whitelistContractsType;       // can be used for vaults whitelist contracts as well
    generalContracts            : generalContractsType;
    whitelistTokenContracts     : whitelistTokenContractsType;      

    // vaults and owners
    vaults                      : big_map(vaultHandleType, vaultRecordType);
    ownerLedger                 : ownerLedgerType;              // for some convenience in checking vaults owned by user

    // collateral tokens
    collateralTokenLedger       : collateralTokenLedgerType;
    loanTokenLedger             : loanTokenLedgerType;

    // lambdas
    lambdaLedger                : lambdaLedgerType;

    // temp
    tempMap                     : map(string, nat);

]