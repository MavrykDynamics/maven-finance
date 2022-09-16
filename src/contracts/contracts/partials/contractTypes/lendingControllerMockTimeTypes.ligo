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

    mockLevel                    : nat;         // mock level for time

]

type lendingControllerBreakGlassConfigType is record [
    
    // Lending Controller Token Pool Entrypoints
    setLoanTokenIsPaused                : bool;
    addLiquidityIsPaused                : bool;
    removeLiquidityIsPaused             : bool;

    // Lending Controller Vault Entrypoints
    updateCollateralTokenIsPaused       : bool;
    registerVaultCreationIsPaused       : bool; 
    closeVaultIsPaused                  : bool;
    registerDepositIsPaused             : bool;
    registerWithdrawalIsPaused          : bool;
    markForLiquidationIsPaused          : bool;
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
    vaultUpdateDepositorIsPaused            : bool;

]


type tokenPoolDepositorLedgerType is big_map((address * string), nat)   // key - user address and token name e.g. USDT, EURL, value - amount


type collateralTokenRecordType is [@layout:comb] record [
    tokenName               : string;
    tokenContractAddress    : address;
    tokenDecimals           : nat;       // token decimals

    oracleType              : string;    // "CFMM", "ORACLE" - use string instead of variant in case of future changes
    oracleAddress           : address;   // zeroAddress if no oracle

    tokenType               : tokenType; 
]
type collateralTokenLedgerType is map(string, collateralTokenRecordType) 


type loanTokenRecordType is [@layout:comb] record [
    
    tokenName                               : string;
    tokenType                               : tokenType; 
    tokenDecimals                           : nat;

    oracleType                              : string;    // "CFMM", "ORACLE" - use string instead of variant in case of future changes
    oracleAddress                           : address;   // zeroAddress if no oracle

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

    minRepaymentAmount                      : nat; 
]

type loanTokenLedgerType is map(string, loanTokenRecordType)


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

    markedForLiquidationTimestamp  : timestamp;                  // timestamp of when vault was marked for liquidation
    
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
    |   ConfigInterestTreasuryShare     of unit
    |   ConfigMockLevel                 of unit

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


type setLoanTokenActionType is [@layout:comb] record [
    tokenName                               : string;
    tokenDecimals                           : nat;

    oracleType                              : string;
    oracleAddress                           : address;

    lpTokenContractAddress                  : address;
    lpTokenId                               : nat;

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


type updateCollateralTokenActionType is [@layout:comb] record [

    tokenName               : string;
    tokenContractAddress    : address;
    tokenDecimals           : nat; 

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


type vaultDepositStakedMvkActionType is [@layout:comb] record [
    vaultId         : nat;
    depositAmount   : nat;
]


type vaultWithdrawStakedMvkActionType is [@layout:comb] record [
    vaultId         : nat;
    withdrawAmount  : nat;
]


type vaultLiquidateStakedMvkActionType is [@layout:comb] record [
    vaultId           : nat;
    vaultOwner        : address;
    liquidator        : address;
    liquidatedAmount  : nat;
]


type claimRewardsType is address


type lendingControllerPausableEntrypointType is

        // Lending Controller Token Pool Entrypoints
    |   SetLoanToken                of bool
    |   AddLiquidity                of bool
    |   RemoveLiquidity             of bool

        // Lending Controller Vault Entrypoints
    |   UpdateCollateralToken       of bool
    |   RegisterVaultCreation       of bool
    |   CloseVault                  of bool
    |   RegisterDeposit             of bool
    |   RegisterWithdrawal          of bool
    |   MarkForLiquidation          of bool
    |   LiquidateVault              of bool
    |   Borrow                      of bool
    |   Repay                       of bool

        // Vault Entrypoints
    |   VaultDelegateTezToBaker     of bool
    |   VaultDelegateMvkToSatellite of bool
    |   VaultWithdraw               of bool
    |   VaultDeposit                of bool
    |   VaultUpdateDepositor        of bool

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

type callVaultStakedMvkActionType is 
    |   VaultDepositStakedMvk           of vaultDepositStakedMvkActionType
    |   VaultWithdrawStakedMvk          of vaultWithdrawStakedMvkActionType
    |   VaultLiquidateStakedMvk         of vaultLiquidateStakedMvkActionType

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
    |   LambdaRegisterVaultCreation           of registerVaultCreationActionType
    |   LambdaCloseVault                      of closeVaultActionType
    |   LambdaMarkForLiquidation              of markForLiquidationActionType
    |   LambdaLiquidateVault                  of liquidateVaultActionType
    |   LambdaRegisterWithdrawal              of registerWithdrawalActionType
    |   LambdaRegisterDeposit                 of registerDepositActionType
    |   LambdaBorrow                          of borrowActionType
    |   LambdaRepay                           of repayActionType

        // Vault Staked MVK Entrypoints   
    |   LambdaCallVaultStakedMvkAction        of callVaultStakedMvkActionType
    |   LambdaVaultDepositStakedMvk           of vaultDepositStakedMvkActionType
    |   LambdaVaultWithdrawStakedMvk          of vaultWithdrawStakedMvkActionType
    |   LambdaVaultLiquidateStakedMvk         of vaultLiquidateStakedMvkActionType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type lendingControllerStorageType is [@layout:comb] record [

    admin                       : address;
    tester                      : address;
    metadata                    : metadataType;
    config                      : lendingControllerConfigType;
    breakGlassConfig            : lendingControllerBreakGlassConfigType;

    mvkTokenAddress             : address;
    governanceAddress           : address;
    
    whitelistContracts          : whitelistContractsType;       // can be used for vaults whitelist contracts as well
    generalContracts            : generalContractsType;
    whitelistTokenContracts     : whitelistTokenContractsType;      

    // token pool
    tokenPoolDepositorLedger    : tokenPoolDepositorLedgerType;

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