// ------------------------------------------------------------------------------
// Required Types
// ------------------------------------------------------------------------------


// Treasury Transfer Types
#include "../../partials/shared/transferTypes.ligo"


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type depositorsType is
  | Any       of unit 
  | Whitelist of set(address)

type vaultHandleType is [@layout:comb] record [
    id      : nat;
    owner   : address;
]

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

type vaultUpdateDepositorType is
    |   AllowAny        of bool
    |   AllowAccount    of bool * address


type vaultDelegateTezToBakerType is option(key_hash)
type satelliteAddressType is address

type vaultWithdrawType is transferDestinationType

type vaultDepositType  is [@layout:comb] record [
    amount          : nat;
    token           : tokenType;
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

        // Vault Entrypoints
    |   LambdaVaultDelegateTezToBaker         of vaultDelegateTezToBakerType
    |   LambdaVaultDelegateMvkToSat           of satelliteAddressType
    |   LambdaVaultWithdraw                   of vaultWithdrawType
    |   LambdaVaultDeposit                    of vaultDepositType 
    |   LambdaVaultUpdateDepositor            of vaultUpdateDepositorType


// ------------------------------------------------------------------------------
// Storage Type
// ------------------------------------------------------------------------------


type vaultStorageType is record [
    
    admin                   : address;                  
    metadata                : metadataType;
    governanceAddress       : address; 

    handle                  : vaultHandleType;          // owner of the vault
    depositors              : depositorsType;           // users who can deposit into the vault    
    
    lambdaLedger            : lambdaLedgerType;
]

