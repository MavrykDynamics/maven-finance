// ------------------------------------------------------------------------------
// Required Types
// ------------------------------------------------------------------------------


// Treasury Transfer Types
#include "../../partials/shared/transferTypes.ligo"


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type editDepositorType is
  | AllowAny of bool
  | AllowAccount of bool * address

type depositorsType is
  | Any
  | Whitelist of set(address)

type whitelistUsersType is
    |   NoWhitelistUsers of unit 
    |   Depositors of set(address)
    |   Borrowers of set(address)
    |   Repayers of set(address)

type vaultHandleType is [@layout:comb] record [
    id      : nat ;
    owner   : address;
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


// type vaultWithdrawTezType is tez * contract(unit)
type vaultDelegateTezToBakerType is option(key_hash)
type satelliteAddressType is address

type vaultWithdrawType is transferDestinationType

// type vaultDepositType is transferTokenType
type vaultDepositType  is [@layout:comb] record [
//     from_           : address;
//     to_             : address;
    amount          : nat;
    token           : tokenType;
//     // tokenName       : string;
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
// Storage
// ------------------------------------------------------------------------------


type vaultStorageType is record [
    admin                : address;            // vault admin contract - usdm token controller address
    handle               : vaultHandleType;    // owner of the vault
    depositors           : depositorsType;     // users who can deposit into the vault    
    whitelistUsers       : whitelistUsersType;    // users who can borrow / repay       
]

