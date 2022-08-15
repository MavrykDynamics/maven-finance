// ------------------------------------------------------------------------------
// Required Types
// ------------------------------------------------------------------------------


// Treasury Transfer Types
#include "../../partials/shared/transferTypes.ligo"


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type vaultEditDepositorType is
    |   AllowAny        of bool
    |   AllowAccount    of bool * address

type depositorsType is
  | Any       of unit 
  | Whitelist of set(address)

type vaultHandleType is [@layout:comb] record [
    id      : nat;
    owner   : address;
]

type vaultBreakGlassConfigType is record [
    // Vault Entrypoints
    vaultDelegateTezToBakerIsPaused         : bool; 
    vaultDelegateMvkToSatelliteIsPaused     : bool;
    vaultWithdrawIsPaused                   : bool;
    vaultDepositIsPaused                    : bool;
    vaultEditDepositorIsPaused              : bool;
]


type vaultPausableEntrypointType is

        // Vault Entrypoints
        VaultDelegateTezToBaker         of bool
    |   VaultDelegateMvkToSatellite     of bool
    |   VaultWithdraw                   of bool
    |   VaultDeposit                    of bool
    |   VaultEditDepositor              of bool

type vaultTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : vaultPausableEntrypointType;
    empty             : unit
];


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


// type vaultWithdrawTezType is tez * contract(unit)
type vaultDelegateTezToBakerType is option(key_hash)
type satelliteAddressType is address

type vaultWithdrawType is transferDestinationType

// type vaultDepositType is transferTokenType
type vaultDepositType  is [@layout:comb] record [
    amount          : nat;
    token           : tokenType;
]

type vaultControllerDepositType is [@layout:comb] record [
    handle      : vaultHandleType; 
    amount      : nat;
    tokenName   : string;
]

type registerDepositType is [@layout:comb] record [
    handle          : vaultHandleType; 
    amount          : nat;
    tokenName       : string;   // name of collateral: tez, token name A, token name B
]

type vaultUpdateCollateralTokensActionType is [@layout:comb] record [
    tokenContractAddress  : address;
    tokenName             : string;
]

// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type vaultLambdaActionType is 
        
        // Housekeeping Entrypoints
    |   LambdaSetAdmin                        of (address)
    |   LambdaSetGovernance                   of (address)
    |   LambdaUpdateMetadata                  of updateMetadataType
    |   LambdaUpdateWhitelistContracts        of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts          of updateGeneralContractsType

        // Pause / Break Glass Lambdas
    |   LambdaPauseAll                        of (unit)
    |   LambdaUnpauseAll                      of (unit)
    |   LambdaTogglePauseEntrypoint           of vaultTogglePauseEntrypointType

        // Vault Entrypoints
    |   LambdaVaultDelegateTezToBaker         of vaultDelegateTezToBakerType
    |   LambdaVaultDelegateMvkToSat           of satelliteAddressType
    |   LambdaVaultWithdraw                   of vaultWithdrawType
    |   LambdaVaultDeposit                    of vaultDepositType 
    |   LambdaVaultEditDepositor              of vaultEditDepositorType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type vaultStorageType is record [
    
    admin                   : address;                  // vault admin contract - usdm token controller address
    metadata                : metadataType;

    governanceAddress       : address; 
    breakGlassConfig        : vaultBreakGlassConfigType; 
    
    whitelistContracts      : whitelistContractsType;
    generalContracts        : generalContractsType;

    handle                  : vaultHandleType;          // owner of the vault
    depositors              : depositorsType;           // users who can deposit into the vault    
    
    lambdaLedger            : lambdaLedgerType;
]

