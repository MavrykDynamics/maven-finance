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
    id      : nat;          // vault id
    owner   : address;      // vault owner
]

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

type delegateTezToBakerType is option(key_hash)
type satelliteAddressType is address

type updateDepositorAllowanceType is
    |   AllowAny        of bool
    |   AllowAccount    of bool * address

type updateDepositorType is [@layout:comb] record [
    allowance       : updateDepositorAllowanceType;
    empty           : unit;
]

type withdrawType  is [@layout:comb] record [
    amount          : nat;
    tokenName       : string
]

type depositType  is [@layout:comb] record [
    amount          : nat;
    tokenName       : string
]

// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type vaultLambdaActionType is 
        
        // Housekeeping Entrypoints
    |   LambdaSetAdmin                   of (address)
    |   LambdaSetGovernance              of (address)
    |   LambdaUpdateMetadata             of updateMetadataType

        // Vault Entrypoints
    |   LambdaDelegateTezToBaker         of delegateTezToBakerType
    |   LambdaDelegateMvkToSat           of satelliteAddressType
    |   LambdaWithdraw                   of withdrawType
    |   LambdaDeposit                    of depositType 
    |   LambdaUpdateDepositor            of updateDepositorType


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

