#include "../partials/vault/vaultGeneralType.ligo"

#include "../partials/vault/vaultWithTokenType.ligo"

#include "../partials/vault/vaultWithTezType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

// ----- general types begin -----

type vaultIdType            is nat;
type zUsdAmountType         is nat;

type vaultOwnerType         is address;
type initiatorAddressType   is address;

type mintOrBurnParamsType is (int * address);

// ----- general types end -----


// ----- storage types begin -----

type vaultType is [@layout:comb] record [
    address                     : address;
    collateralBalance           : nat;                 // tez_balance in ctez
    collateralTokenAddress      : address;             // zero address for tez
    vaultType                   : vaultCollateralType; // XTZ / FA12 / FA2 of unit
    zUsdOutstanding             : zUsdAmountType;      // nat 
]

// ----- storage types end -----


// ----- types for entrypoint actions begin -----

type setAddressesActionType is [@layout:comb] record [
    cfmmAddress                 : address; 
    zUsdTokenAddress            : address; 
]

type createVaultActionType is [@layout:comb] record [
    id                          : nat; 
    delegate                    : option(key_hash); 
    depositors                  : depositorsType;
    tokenContractAddress        : string;               // "none" for XTZ 
    tokenAmount                 : nat;
    vaultType                   : vaultCollateralType;  // XTZ / FA12 / FA2 of unit
]

type withdrawFromVaultActionType is [@layout:comb] record [
    id                          : vaultIdType; 
    amount                      : tez;  
    [@annot:to] to_             : contract(unit);
]

type liquidateVaultActionType is [@layout:comb] record [
    handle                      : vaultHandleType; 
    quantity                    : nat; 
    [@annot:to] to_             : contract(unit);
]

type mintOrBurnActionType is [@layout:comb] record [ 
    id          : nat; 
    quantity    : int;
]

type cfmmPriceActionType is (nat * nat);

// ----- types for entrypoint actions end -----


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
    | UpdateWhitelistTokenContracts  of updateWhitelistTokenContractsParams
    | SetAddresses                   of setAddressesActionType

    | CfmmPrice                      of cfmmPriceActionType

    | CreateVault                    of createVaultActionType
    | WithdrawFromVault              of withdrawFromVaultActionType
    | LiquidateVault                 of liquidateVaultActionType

    | RegisterDeposit                of registerTezDepositType
    | MintOrBurn                     of mintOrBurnActionType
    | GetTarget                      of contract(nat)


const noOperations : list (operation) = nil;
type return is list (operation) * controllerStorage


// ----- constants begin -----

const zeroAddress          : address  = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);
const fixedPointAccuracy   : nat      = 1_000_000_000_000_000_000_000_000n // 10^24 - // for use in division

// ----- constants end -----


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

// helper function to get mintOrBurn entrypoint from zUSD contract
function getZUsdMintOrBurnEntrypoint(const tokenContractAddress : address) : contract(mintOrBurnParamsType) is
  case (Tezos.get_entrypoint_opt(
      "%mintOrBurn",
      tokenContractAddress) : option(contract(mintOrBurnParamsType))) of
    Some(contr) -> contr
  | None -> (failwith("Error. MintOrBurn entrypoint in token contract not found") : contract(mintOrBurnParamsType))
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

function setAddresses(const setAddressesParams : setAddressesActionType; var s : controllerStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

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




function cfmmPrice(const cfmmPriceParams : cfmmPriceActionType; var s : controllerStorage) : return is 
block {

    // init variables for convenience
    const tezAmount         : nat               = cfmmPriceParams.0;
    const tokenAmount       : nat               = cfmmPriceParams.1;
    const cfmmAddress       : address           = s.cfmmAddress;

    // check if sender is from the cfmm address
    if Tezos.sender =/= cfmmAddress then failwith("Error. Caller must be CFMM contract.")  else skip;

    // check that last drift update is before current time
    if s.lastDriftUpdate > Tezos.now then failwith("Error. Delta cannot be negative.") else skip;
    const delta   : nat   = abs(Tezos.now - s.lastDriftUpdate);

    var target    : nat  := s.target;
    var d_target  : nat  := (target * abs(s.drift) * delta) / fixedPointAccuracy;

    target := if s.drift < 0 then abs(target - d_target) else target + d_target;

    var price            : nat   := (tezAmount * fixedPointAccuracy) / tokenAmount;
    var targetLessPrice  : int   := target - price;

    const x              : nat    = (abs(targetLessPrice * targetLessPrice) / fixedPointAccuracy);
    const priceSquared   : nat    = price * price; 
    const d_drift        : nat    = if x > priceSquared then delta else delta / priceSquared;

    var drift            : int    := if targetLessPrice > 0 then s.drift + d_drift else s.drift - d_drift;

    s.drift              := drift;
    s.target             := target;
    s.lastDriftUpdate    := Tezos.now;

    // math probably not correct with the divisions - double check with checker formula

// (* todo: restore when ligo interpret is fixed
//    let cfmm_price (storage : storage) (tez : tez) (token : nat) : result =      *)
// let cfmm_price (storage, tez, token : storage * nat * nat) : result =
//   if Tezos.sender <> storage.cfmm_address then
//     (failwith error_CALLER_MUST_BE_CFMM : result)
//   else
//     let delta = abs (Tezos.now - storage.last_drift_update) in
//     let target = storage.target in
//     let d_target = Bitwise.shift_right (target * (abs storage.drift) * delta) 48n in
//     (* We assume that `target - d_target < 0` never happens for economic reasons.
//        Concretely, even drift were as low as -50% annualized, it would take not
//        updating the target for 1.4 years for a negative number to occur *)
//     let target  = if storage.drift < 0  then abs (target - d_target) else target + d_target in
//     (* This is not homegeneous, but setting the constant delta is multiplied with
//            to 1.0 magically happens to be reasonable. Why?
//            Because (24 * 3600 / 2^48) * 365.25*24*3600 ~ 0.97%.
//            This means that the annualized drift changes by roughly one percentage point
//            for each day over or under the target by more than 1/64th.
//         *)

//     let price = (Bitwise.shift_left tez 48n) / token in
//     let target_less_price : int = target - price in
//     let d_drift =
//       let x = Bitwise.shift_left (abs (target_less_price * target_less_price)) 10n in
//       let p2 = price * price  in
//       if x > p2 then delta else x * delta / p2 in

//     let drift =
//     if target_less_price > 0 then
//       storage.drift + d_drift
//     else
//       storage.drift - d_drift in

//     (([] : operation list), {storage with drift = drift ; last_drift_update = Tezos.now ; target = target})


} with (noOperations, s)





(* createVault entrypoint *)
function createVault(const createParams : createVaultActionType ; var s : controllerStorage) : return is 
block {
    
    // make vault handle
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




(* withdrawFromVault entrypoint *)
function withdrawFromVault(const withdrawParams : withdrawFromVaultActionType; var s : controllerStorage) : return is 
block {

    // init variables for convenience
    const vaultId           : vaultIdType       = withdrawParams.id; 
    const withdrawAmount    : tez               = withdrawParams.amount;
    const recipient         : contract(unit)    = withdrawParams.to_;
    const initiator         : vaultOwnerType    = Tezos.sender;
    var operations          : list(operation)  := nil;

    // make vault handle
    const vaultHandle : vaultHandleType = record [
        id     = vaultId;
        owner  = initiator;
    ];

    // get vault
    var vault : vaultType := getVault(vaultHandle, s);

    // calculate new vault balance
    if mutezToNatural(withdrawAmount) > vault.collateralBalance then failwith("Error. Withdrawal amount cannot be greater than your collateral balance.") else skip;
    const newCollateralBalance : nat  = abs(vault.collateralBalance - mutezToNatural(withdrawAmount));

    // check if vault is undercollaterized, if not then send withdraw operation
    if isUnderCollaterized(vault, s) then failwith("Error. Withdrawal is not allowed as vault is undercollaterized.") 
    else block {
        const withdrawOperationParams : vaultWithdrawTezType = (withdrawAmount, recipient);
        const withdrawOperation : operation = Tezos.transaction(
            withdrawOperationParams,
            0mutez,
            getVaultWithdrawTezEntrypoint(vault.address)
        );
        operations := withdrawOperation # operations;
    };

    // update and save vault with new collateral balance
    vault.collateralBalance  := newCollateralBalance;
    s.vaults[vaultHandle]    := vault;

} with (operations, s)




(* registerDeposit entrypoint *)
function registerDeposit(const registerDepositParams : registerTezDepositType; var s : controllerStorage) : return is 
block {

    // init variables for convenience
    const vaultHandle     : vaultHandleType   = registerDepositParams.handle;
    const depositAmount   : tez               = registerDepositParams.amount;
    const initiator       : vaultOwnerType    = Tezos.sender;

    // get vault
    var _vault : vaultType := getVault(vaultHandle, s);

    // check if sender matches vault owner; if match, then update and save vault with new collateral balance
    if _vault.address =/= initiator then failwith("Error. Sender does not match vault owner address.") else block {

        // calculate new collateral balance with deposit amount
        const newCollateralBalance : nat = _vault.collateralBalance + mutezToNatural(depositAmount);

        // update and save vault with new collateral balance
        _vault.collateralBalance := newCollateralBalance;
        s.vaults[vaultHandle]    := _vault;

    };
    
} with (noOperations, s)




(* liquidateVault entrypoint *)
function liquidateVault(const liquidateParams : liquidateVaultActionType; var s : controllerStorage) : return is 
block {
    
    // init variables for convenience
    const vaultHandle       : vaultHandleType         = liquidateParams.handle; 
    const quantity          : nat                     = liquidateParams.quantity;
    const recipient         : contract(unit)          = liquidateParams.to_;
    const initiator         : initiatorAddressType    = Tezos.sender;
    const target            : nat                     = s.target; 
    var operations          : list(operation)        := nil;

    // get vault
    var _vault : vaultType := getVault(vaultHandle, s);

    if isUnderCollaterized(_vault, s) then block {
        
        if quantity > _vault.zUsdOutstanding then failwith("Error. Cannot burn more than outstanding amount of zUSD.") else skip;

        const vaultCollateralBalance : nat = _vault.collateralBalance;
        
        const remainingZUsd     : zUsdAmountType = abs(_vault.zUsdOutstanding - quantity);

        (* get 32/31 of the target price, meaning there is a 1/31 penalty (3.23%) for the oven owner for being liquidated *)
        const extractedBalance  : nat = (quantity * target * fixedPointAccuracy) / (31n * fixedPointAccuracy); // double check maths

        // calculate new vault collateral balance
        const newCollateralBalance : nat = abs(vaultCollateralBalance - extractedBalance);

        // save and update new vault params - zUsdOutstanding and collateral
        _vault.zUsdOutstanding    := remainingZUsd;
        _vault.collateralBalance  := newCollateralBalance;
        s.vaults[vaultHandle]    := _vault;

        // operation to send collateral to initiator of liquidation
        const initiatorTakeCollateralParams : vaultWithdrawTezType = (naturalToMutez(extractedBalance), recipient);
        const initiatorTakeCollateralOperation : operation = Tezos.transaction(
            initiatorTakeCollateralParams,
            0mutez,
            getVaultWithdrawTezEntrypoint(_vault.address)
        );
        operations := initiatorTakeCollateralOperation # operations;

        // operation to burn zUSD
        const burnZUsdOperationParams : mintOrBurnParamsType = (-quantity, initiator);
        const burnZUsdOperation : operation = Tezos.transaction(
            burnZUsdOperationParams,
            0mutez,
            getZUsdMintOrBurnEntrypoint(s.zUsdTokenAddress)
        );
        operations := burnZUsdOperation # operations;

    } else failwith("Error. Vault is not undercollaterized and cannot be liquidated.");

} with (operations, s)




(* mintOrBurn entrypoint *)
function mintOrBurn(const mintOrBurnParams : mintOrBurnActionType; var s : controllerStorage) : return is 
block {
    
    // init variables for convenience
    const id                : nat                     = mintOrBurnParams.id; 
    const quantity          : int                     = mintOrBurnParams.quantity;
    const initiator         : initiatorAddressType    = Tezos.sender;
    var operations          : list(operation)        := nil;

    // make vault handle
    const vaultHandle : vaultHandleType = record [
        id     = id;
        owner  = initiator;
    ];

    // get vault if exists
    var vault : vaultType := getVault(vaultHandle, s);

    // check if quantity to burn exceeds vault's zUsdOutstanding
    if vault.zUsdOutstanding + quantity < 0 then failwith("Error. Cannot burn more than outstanding amount of zUSD.") else skip;
    const newZUsdOutstanding : zUsdAmountType = abs(vault.zUsdOutstanding + quantity); 
    vault.zUsdOutstanding := newZUsdOutstanding;
    s.vaults[vaultHandle] := vault;

    // check if vault is undercollaterized; if it is not, then create and send mintOrBurn operation to zUSD Token Contract
    if isUnderCollaterized(vault, s) then failwith("Error. Excessive zUSD minting and vault will be undercollaterized.")
    else block {

        // create and send mintOrBurn operation to zUSD Token Contract
        const zUsdMintOrBurnParams : mintOrBurnParamsType = (quantity, initiator);
        const mintOrBurnOperation : operation = Tezos.transaction(
            zUsdMintOrBurnParams,
            0mutez,
            getZUsdMintOrBurnEntrypoint(s.zUsdTokenAddress)
        );
        operations := mintOrBurnOperation # operations;

    };

} with (operations, s)




(* getTarget entrypoint *)
function getTarget(const callbackContract : contract(nat); var s : controllerStorage) : return is 
block {

    const callbackOperation : operation = Tezos.transaction(
        s.target,
        0mutez,
        callbackContract
    );

} with (list[callbackOperation], s)




function main (const action : controllerAction; const s : controllerStorage) : return is 
    case action of
        | UpdateWhitelistTokenContracts(parameters)     -> updateWhitelistTokenContracts(parameters, s)
        | SetAddresses(parameters)                      -> setAddresses(parameters, s)

        | CfmmPrice(parameters)                         -> cfmmPrice(parameters, s)

        | CreateVault(parameters)                       -> createVault(parameters, s)
        | WithdrawFromVault(parameters)                 -> withdrawFromVault(parameters, s)
        | LiquidateVault(parameters)                    -> liquidateVault(parameters, s)
        
        | RegisterDeposit(parameters)                   -> registerDeposit(parameters, s)
        | MintOrBurn(parameters)                        -> mintOrBurn(parameters, s)
        | GetTarget(parameters)                         -> getTarget(parameters, s)

    end