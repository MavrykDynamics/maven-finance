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

type configType is [@layout:comb] record [
    
    collateralRatio           : nat;    // collateral ratio
    liquidationRatio          : nat;    // liquidation ratio
    
    liquidationFee            : nat;    // liquidation fee - penalty fee paid by vault owner to liquidator
    adminLiquidationFee       : nat;    // admin liquidation fee - penalty fee paid by vault owner to treasury

    minimumLoanFee            : nat;    // minimum loan fee - taken at first minting
    annualServiceLoanFee      : nat;    // annual service loan fee - compounding over time    
    dailyServiceLoanFee       : nat;    // daily service loan fee - compounding over time (annualServiceLoanFee / 365)
    // blocksPerMinute           : nat;  // use new helper from jakarta

    decimals                  : nat;    // decimals 

]

type vaultControllerBreakGlassConfigType is record [
    
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


type collateralTokenRecordType is [@layout:comb] record [

    tokenName               : string;
    tokenContractAddress    : address;
    tokenType               : tokenType; // from vaultType.ligo partial - Tez, FA12, FA2
    decimals                : nat; 
    oracleType              : string;    // "CFMM", "ORACLE" - use string instead of variant in case of future changes
    oracleAddress           : address;   // zeroAddress if no oracle

]
type collateralTokenLedgerType is map(string, collateralTokenRecordType) 

type loanTokenRecordType is [@layout:comb] record [
    tokenContractAddress    : address;
    tokenType               : tokenType; // from vaultType.ligo partial - Tez, FA12, FA2
    decimals                : nat; 
]
type loanTokenLedgerType is big_map(string, loanTokenRecordType)

type collateralBalanceLedgerType  is map(collateralNameType, tokenBalanceType) // to keep record of token collateral (tez/token)
type vaultType is [@layout:comb] record [

    address                     : address;
    collateralBalanceLedger     : collateralBalanceLedgerType;   // tez/token balance
    
    loanOutstanding             : nat;                
    loanToken                   : string;                        // e.g. USDT, EURL,  
    lastUpdatedBlockLevel       : nat;                           // block level of when vault was last updated for loans payment

]

// owner types
type ownerVaultSetType              is set(vaultIdType)                     // set of vault ids belonging to the owner 
type ownerLedgerType                is big_map(address, ownerVaultSetType)  // big map of owners, and the corresponding vaults they own
type vaultLedgerType                is big_map(vaultIdType, bool);

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

type vaultControllerUpdateConfigNewValueType is nat
type vaultControllerUpdateConfigActionType is 
        
        ConfigCollateralRatio           of unit
    |   ConfigLiquidationRatio          of unit
    |   ConfigLiquidationFee            of unit
    |   ConfigAdminLiquidationFee       of unit
    |   ConfigMinimumLoanFee            of unit
    |   ConfigAnnualServiceLoanFee      of unit
    |   ConfigDailyServiceLoanFee       of unit
    |   ConfigDecimals                  of unit

type vaultControllerUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : vaultControllerUpdateConfigNewValueType; 
    updateConfigAction      : vaultControllerUpdateConfigActionType;
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
    loanToken                   : string;            // use string, not variant, to account for future loan types using the same controller contract
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


type vaultControllerPausableEntrypointType is

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

type vaultControllerTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : vaultControllerPausableEntrypointType;
    empty             : unit
];


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type vaultControllerLambdaActionType is 
        
        // Housekeeping Entrypoints
    |   LambdaSetAdmin                        of (address)
    |   LambdaSetGovernance                   of (address)
    |   LambdaUpdateMetadata                  of updateMetadataType
    |   LambdaUpdateConfig                    of vaultControllerUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts        of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts          of updateGeneralContractsParams
    |   LambdaUpdateWhitelistTokens           of updateWhitelistTokenContractsParams
    |   LambdaUpdateCollateralTokens          of updateCollateralTokenLedgerActionType

        // Pause / Break Glass Lambdas
    |   LambdaPauseAll                        of (unit)
    |   LambdaUnpauseAll                      of (unit)
    |   LambdaTogglePauseEntrypoint           of vaultControllerTogglePauseEntrypointType

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


type vaultControllerStorage is [@layout:comb] record [

    admin                       : address;
    config                      : configType;
    breakGlassConfig            : vaultControllerBreakGlassConfigType;

    mvkTokenAddress             : address;
    governanceAddress           : address;
    
    whitelistContracts          : whitelistContractsType;
    generalContracts            : generalContractsType;
    whitelistTokenContracts     : whitelistTokenContractsType;      

    // vaults and owners
    vaults                      : big_map(vaultHandleType, vaultType);
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