// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type vaultFactoryBreakGlassConfigType is [@layout:comb] record [
    createVaultIsPaused     : bool;
    empty                   : unit;
]


type vaultFactoryConfigType is [@layout:comb] record [
    vaultNameMaxLength      : nat;
    empty                   : unit;
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

type createVaultType is [@layout:comb] record[
    baker                       : option(key_hash); 
    loanTokenName               : string;            // use string, not variant, to account for future loan types using the same controller contract
    name                        : string;
    collateral                  : option(list(depositType));
    depositors                  : depositorsType;
]


type vaultFactoryUpdateConfigNewValueType is nat
type vaultFactoryUpdateConfigActionType is 
    |   ConfigVaultNameMaxLength of unit
    |   Empty                    of unit

type vaultFactoryUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : vaultFactoryUpdateConfigNewValueType; 
    updateConfigAction      : vaultFactoryUpdateConfigActionType;
]


type vaultFactoryPausableEntrypointType is
    |   CreateVault         of bool  
    |   Empty               of unit 

type vaultFactoryTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : vaultFactoryPausableEntrypointType;
    empty             : unit
];


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type vaultFactoryLambdaActionType is 

        // Housekeeping Entrypoints
        LambdaSetAdmin                    of (address)
    |   LambdaSetGovernance               of (address)
    |   LambdaUpdateMetadata              of updateMetadataType
    |   LambdaUpdateConfig                of vaultFactoryUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts    of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts      of updateGeneralContractsType
    |   LambdaMistakenTransfer            of transferActionType

        // Pause / Break Glass Entrypoints
    |   LambdaPauseAll                    of (unit)
    |   LambdaUnpauseAll                  of (unit)
    |   LambdaTogglePauseEntrypoint       of vaultFactoryTogglePauseEntrypointType

        // Vault Factory Entrypoints
    |   LambdaCreateVault                 of createVaultType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type vaultFactoryStorageType is [@layout:comb] record[
    admin                  : address;
    metadata               : metadataType;
    vaultMetadata          : metadataType;
    config                 : vaultFactoryConfigType;

    mvnTokenAddress        : address;
    governanceAddress      : address;

    whitelistContracts     : whitelistContractsType;      
    generalContracts       : generalContractsType;

    breakGlassConfig       : vaultFactoryBreakGlassConfigType;

    vaultCounter           : nat;      

    lambdaLedger           : lambdaLedgerType;
    vaultLambdaLedger      : lambdaLedgerType;
]
