// ------------------------------------------------------------------------------
// Required Types
// ------------------------------------------------------------------------------


// Treasury Transfer Types
#include "../../partials/shared/transferTypes.ligo"


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type depositorsConfigType is
    |   Any       of unit 
    |   Whitelist of unit

type depositorsType is [@layout:comb] record [
    whitelistedDepositors   : set(address);
    depositorsConfig        : depositorsConfigType; 
]

type vaultHandleType is [@layout:comb] record [
    id      : nat;          // vault id
    owner   : address;      // vault owner
]

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

type delegateTezToBakerType is option(key_hash)
type satelliteAddressType is address

type updateDepositorType is [@layout:comb] record [
    depositorAddress        : address;
    addOrRemoveBool         : bool;
    depositorsConfig        : depositorsConfigType;
]

type withdrawType  is [@layout:comb] record [
    amount          : nat;
    tokenName       : string
]

type depositType  is [@layout:comb] record [
    amount          : nat;
    tokenName       : string
]

type onLiquidateType  is [@layout:comb] record [
    receiver        : address;
    amount          : nat;
    tokenName       : string
]

type updateTokenOperatorsType is [@layout:comb] record [
    tokenName        : string;
    updateOperators  :  updateOperatorsType
];

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
    |   LambdaDeposit                    of depositType 
    |   LambdaWithdraw                   of withdrawType
    |   LambdaOnLiquidate                of onLiquidateType 
    |   LambdaUpdateDepositor            of updateDepositorType
    |   LambdaUpdateTokenOperators       of updateTokenOperatorsType


// ------------------------------------------------------------------------------
// Storage Type
// ------------------------------------------------------------------------------


type vaultStorageType is record [
    
    admin                   : address;                  
    metadata                : metadataType;
    mvkTokenAddress         : address;
    governanceAddress       : address; 

    handle                  : vaultHandleType;          // owner of the vault
    depositors              : depositorsType;           // users who can deposit into the vault    
    
    lambdaLedger            : lambdaLedgerType;
]

