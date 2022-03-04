#include "../partials/vault/vaultGeneralType.ligo"

#include "../partials/vault/vaultWithTokenType.ligo"

#include "../partials/vault/vaultWithTezType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

type setAddressesType is [@layout:comb] record [
    cfmmAddress                 : address; 
    zUsdTokenAddress            : address; 
]

type createActionType is [@layout:comb] record [
    id                          : nat; 
    delegate                    : option(key_hash); 
    depositors                  : depositorsType;
    tokenContractAddress        : string;               // "none" for XTZ 
    tokenAmount                 : nat;
    vaultType                   : vaultCollateralType;  // XTZ / FA12 / FA2 of unit
]

type liquidateActionType is [@layout:comb] record [
    handle                      : vaultHandleType; 
    quantity                    : nat; 
    [@annot:to] to_             : contract(unit);
]

type withdrawActionType is [@layout:comb] record [
    id                          : nat; 
    amount                      : tez;  
    [@annot:to] to_             : contract(unit);
]

type vaultType is [@layout:comb] record [
    address                     : address;
    collateralBalance           : nat;                 // tez_balance in ctez
    collateralTokenAddress      : address;             // zero address for tez
    vaultType                   : vaultCollateralType; // XTZ / FA12 / FA2 of unit
    zUsdOutstanding             : nat; 
]

type mintOrBurn is [@layout:comb] record [
    id       : nat; 
    quantity : int;
]

type controllerStorage is [@layout:comb] record [
    admin                       : address;
    whitelistTokenContracts     : whitelistTokenContractsType;      
    vaults                      : big_map(vaultHandleType, vaultType);

    target                      : nat;
    drift                       : int;
    lastDriftUpdate             : timestamp;

    zUsdTokenAddress            : address;  // zUSD token contract address
    cfmmAddress                 : address;  // cfmm address providing the price feed
]

type controllerAction is 
    | UpdateWhitelistTokenContracts of updateWhitelistTokenContractsParams
    | SetAddresses       of setAddressesType

    | CreateVault        of createActionType
    | WithdrawFromVault  of withdrawActionType
    | LiquidateVault     of liquidateActionType

const noOperations : list (operation) = nil;
type return is list (operation) * controllerStorage

const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

// vault with token
#include "vaultWithToken.ligo"

// vault with tez 
#include "vaultWithTez.ligo"

// helper functions - conversions
function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;

// helper function - check sender is admin
function checkSenderIsAdmin(var s : controllerStorage) : unit is
  if (Tezos.sender = s.admin) then unit
  else failwith("Error. Only the administrator can call this entrypoint.");

// helper function to get vaultWithdrawTez entrypoint
function getVaultWithdrawTezEntrypoint(const vaultAddress : address) : contract(vaultWithdrawTezType) is
  case (Tezos.get_entrypoint_opt(
      "%vaultWithdrawTez",
      vaultAddress) : option(contract(vaultWithdrawTezType))) of
    Some(contr) -> contr
  | None -> (failwith("Error. VaultWithdrawTez entrypoint in vault not found") : contract(vaultWithdrawTezType))
  end;

// helper function to get vaultDelegateTez entrypoint
function getVaultDelegateTezEntrypoint(const vaultAddress : address) : contract(vaultDelegateTezType) is
  case (Tezos.get_entrypoint_opt(
      "%vaultDelegateTez",
      vaultAddress) : option(contract(vaultDelegateTezType))) of
    Some(contr) -> contr
  | None -> (failwith("Error. vaultDelegateTez entrypoint in vault not found") : contract(vaultDelegateTezType))
  end;

// Whitelist Token Contracts: checkInWhitelistTokenContracts, updateWhitelistTokenContracts - cannot include as storage type is different
function checkInWhitelistTokenContracts(const contractAddress : address; var s : controllerStorage) : bool is 
block {
  var inWhitelistTokenContractsMap : bool := False;
  for _key -> value in map s.whitelistTokenContracts block {
    if contractAddress = value then inWhitelistTokenContractsMap := True
      else skip;
  }  
} with inWhitelistTokenContractsMap

(* UpdateWhitelistTokenContracts Entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s : controllerStorage) : return is 
  block{

    checkSenderIsAdmin(s); // check that sender is admin

    const contractName     : string  = updateWhitelistTokenContractsParams.0;
    const contractAddress  : address = updateWhitelistTokenContractsParams.1;
    
    const existingAddress: option(address) = 
      if checkInWhitelistTokenContracts(contractAddress, s) then (None : option(address)) else Some (contractAddress);

    const updatedWhitelistTokenContracts: whitelistTokenContractsType = 
      Map.update(
        contractName, 
        existingAddress,
        s.whitelistTokenContracts
      );

    s.whitelistTokenContracts := updatedWhitelistTokenContracts

  } with (noOperations, s) 

// helper function to create vault with token
type createVaultWithTokenFuncType is (option(key_hash) * tez * vaultTokenStorage) -> (operation * address)
const createVaultWithTokenFunc : createVaultWithTokenFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/vaultWithToken.tz"
        ;
          PAIR } |}
: createVaultWithTokenFuncType)];

// helper function to create vault with tez
type createVaultWithTezFuncType is (option(key_hash) * tez * vaultTezStorage) -> (operation * address)
const createVaultWithTezFunc : createVaultWithTezFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/vaultWithTez.tz"
        ;
          PAIR } |}
: createVaultWithTezFuncType)];

// helper function to get vault
function getVault(const handle : vaultHandleType; var s : controllerStorage) : vaultType is 
block {
    const vault : vaultType = case s.vaults[handle] of 
        Some(_vault) -> _vault
        | None -> failwith("Error. Vault not found.")
    end;
} with vault

// helper function to check if vault is under collaterized
function isUnderCollaterized(const vault : vaultType; var s : controllerStorage) : bool is 
block {
    const isUnderCollaterized : bool  = (15n * vault.collateralBalance) < (Bitwise.shift_right (vault.zUsdOutstanding * s.target, 44n));
} with isUnderCollaterized

function setAddresses(const setAddressesParams : setAddressesType; var s : controllerStorage) : return is
block {
    // set zUsdTokenAddress and cfmmAddress if they have not been set, otherwise fail 
    // (i.e. they can only be set once after contract origination)
    if s.zUsdTokenAddress =/= ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) then 
        failwith("Error. zUsdTokenAddress is already set.")
    else if s.cfmmAddress =/= ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) then
        failwith("Error. cfmmAddress is already set.")
    else block {
        s.cfmmAddress      := setAddressesParams.cfmmAddress;
        s.zUsdTokenAddress := setAddressesParams.zUsdTokenAddress;
    }
} with (noOperations, s)

(* create vault entrypoint *)
function createVault(const createParams : createActionType ; var s : controllerStorage) : return is 
block {
    
    // get vault handle
    const handle : vaultHandleType = record [
        id     = createParams.id;
        owner  = Tezos.sender;
    ];

    // check if vault already exists
    if Big_map.mem(handle, s.vaults) then failwith("Error. Vault already exists.") else skip;

    // init operations
    var operations : list(operation) := nil;

    case createParams.vaultType of 
        XTZ(_v) -> block {

            // params for vault with tez storage origination
            const originateVaultWithTezStorage : vaultTezStorage = record [
                admin               = Tezos.self_address;
                handle              = handle;
                depositors          = createParams.depositors;
                vaultCollateralType = XTZ(unit);
            ];

            // originate vault with tez func
            const vaultWithTezOrigination : (operation * address) = createVaultWithTezFunc(
                (None : option(key_hash)), 
                Tezos.amount,
                originateVaultWithTezStorage
            );

            // add vaultWithTezOrigination operation to operations list
            operations := vaultWithTezOrigination.0 # operations; 

            // create new vault params
            const vault : vaultType = record [
                collateralBalance       = mutezToNatural(Tezos.amount); 
                zUsdOutstanding         = 0n;
                address                 = vaultWithTezOrigination.1; // vault address
                collateralTokenAddress  = zeroAddress;
                vaultType               = XTZ(unit);
            ];

            // update controller storage with new vault
            s.vaults := Big_map.update(handle, Some(vault), s.vaults);

        }
      | FA2(_v) -> block {

            // get token contract address
            const tokenCollateralContractAddress : address = case s.whitelistTokenContracts[createParams.tokenContractAddress] of
                Some(_address) -> _address
                | None -> failwith("Error. Token contract address not found in whitelist token contracts.")
            end;

            // params for vault with token storage origination
            const originateVaultWithTokenStorage : vaultTokenStorage = record [
                admin                   = Tezos.self_address;
                handle                  = handle;
                depositors              = createParams.depositors;
                collateralTokenAddress  = tokenCollateralContractAddress;
                vaultCollateralType     = FA2(unit);
            ];

            // originate vault with token func
            const vaultWithTokenOrigination : (operation * address) = createVaultWithTokenFunc(
                (None : option(key_hash)), 
                0tez,
                originateVaultWithTokenStorage
            );

            // todo: transfer tokens to vault

            // add vaultWithTokenOrigination operation to operations list
            operations := vaultWithTokenOrigination.0 # operations; 

            // create new vault params
            const vault : vaultType = record [
                collateralBalance       = createParams.tokenAmount; 
                zUsdOutstanding         = 0n;
                address                 = vaultWithTokenOrigination.1;     // vault address
                collateralTokenAddress  = tokenCollateralContractAddress;
                vaultType               = FA2(unit);
            ];

            // update controller storage with new vault
            s.vaults := Big_map.update(handle, Some(vault), s.vaults);
        
        }
      | FA12(_v) -> block {
        
            // get token contract address
            const tokenCollateralContractAddress : address = case s.whitelistTokenContracts[createParams.tokenContractAddress] of
                Some(_address) -> _address
                | None -> failwith("Error. Token contract address not found in whitelist token contracts.")
            end;

            // params for vault with token storage origination
            const originateVaultWithTokenStorage : vaultTokenStorage = record [
                admin                   = Tezos.self_address;
                handle                  = handle;
                depositors              = createParams.depositors;
                collateralTokenAddress  = tokenCollateralContractAddress;
                vaultCollateralType     = FA12(unit);
            ];

            // originate vault with token func
            const vaultWithTokenOrigination : (operation * address) = createVaultWithTokenFunc(
                (None : option(key_hash)), 
                0tez,
                originateVaultWithTokenStorage
            );

            // todo: transfer tokens to vault

            // add vaultWithTokenOrigination operation to operations list
            operations := vaultWithTokenOrigination.0 # operations; 

            // create new vault params
            const vault : vaultType = record [
                address                 = vaultWithTokenOrigination.1;     // vault address
                collateralBalance       = createParams.tokenAmount; 
                collateralTokenAddress  = tokenCollateralContractAddress;
                vaultType               = FA12(unit);
                zUsdOutstanding         = 0n;
            ];

            // update controller storage with new vault
            s.vaults := Big_map.update(handle, Some(vault), s.vaults);
        }
    end;

} with (operations, s)

function withdrawFromVault(const _withdrawParams : withdrawActionType; var s : controllerStorage) : return is 
block {
    
    // Steps Overview:
    // 1. 
    // 2.
    
    skip
} with (noOperations, s)

function liquidateVault(const _liquidateParams : liquidateActionType; var s : controllerStorage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2.
    
    skip
} with (noOperations, s)

function main (const action : controllerAction; const s : controllerStorage) : return is 
    case action of
        | UpdateWhitelistTokenContracts(parameters) -> updateWhitelistTokenContracts(parameters, s)
        | SetAddresses(parameters) -> setAddresses(parameters, s)

        | CreateVault(parameters) -> createVault(parameters, s)
        | WithdrawFromVault(parameters) -> withdrawFromVault(parameters, s)
        | LiquidateVault(parameters) -> liquidateVault(parameters, s)
    end