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

type updateDepositorType is
    |   AllowAny        of bool
    |   AllowAccount    of bool * address


type delegateTezToBakerType is option(key_hash)
type satelliteAddressType is address

type withdrawType is transferDestinationType

type depositType  is [@layout:comb] record [
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

