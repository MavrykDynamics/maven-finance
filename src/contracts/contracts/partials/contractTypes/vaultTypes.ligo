// ------------------------------------------------------------------------------
// Required Types
// ------------------------------------------------------------------------------


// Treasury Transfer Types
#include "../../partials/shared/transferTypes.ligo"


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type depositorsType is 
    |   Any         of unit
    |   Whitelist   of set(address)


type vaultHandleType is [@layout:comb] record [
    id      : nat;          // vault id
    owner   : address;      // vault owner
]

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

type setBakerType is option(key_hash)
type delegateToSatelliteType is address

type updateDepositorAllowanceType is
    |   Any         of bool
    |   Whitelist   of (bool * address)

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

type onLiquidateSingleType  is [@layout:comb] record [
    receiver        : address;
    amount          : nat;
    tokenName       : string
]
type onLiquidateListType is list(onLiquidateSingleType)

type updateTokenOperatorsType is [@layout:comb] record [
    tokenName        : string;
    updateOperators  :  updateOperatorsType
];


type initVaultActionType is 
    |   SetBaker                of setBakerType
    |   DelegateToSatellite     of delegateToSatelliteType
    |   Deposit                 of depositType
    |   Withdraw                of withdrawType
    |   OnLiquidate             of onLiquidateListType
    |   UpdateDepositor         of updateDepositorType
    |   UpdateTokenOperators    of updateTokenOperatorsType
    |   UpdateVaultName         of string


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type vaultLambdaActionType is 

        // Vault Entrypoints
    |   LambdaDepositMvrk                of unit
    |   LambdaInitVaultAction            of initVaultActionType

// ------------------------------------------------------------------------------
// Storage Type
// ------------------------------------------------------------------------------


type vaultStorageType is record [
    admin                   : address;                  // vault factory contract
    name                    : string;                   // vault name
    handle                  : vaultHandleType;          // owner of the vault
    depositors              : depositorsType;           // users who can deposit into the vault    
    vaultConfig             : string;                   // vault config

    // lastInterestPayment     : timestamp;                // timestamp of last interest payment

]

