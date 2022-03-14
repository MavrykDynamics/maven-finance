#include "../partials/vault/vaultType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

// ----- general types begin -----

type vaultIdType                 is nat;
type usdmAmountType              is nat;
type tokenBalanceType            is nat;

type vaultOwnerType              is address;
type initiatorAddressType        is address;
type tokenContractAddressType    is address;

type collateralNameType          is string;

type mintOrBurnParamsType is (int * address);

// ----- general types end -----


// ----- storage types begin -----

type collateralBalanceLedgerType  is map(collateralNameType, tokenBalanceType) // to keep record of token collateral (tez/token)
type collateralTokenRecord is [@layout:comb] record [
    tokenContractAddress    : address;
    tokenType               : tokenType; // from vaultType.ligo partial
]
type collateralTokenLedgerType is map(string, collateralTokenRecord) 

type vaultType is [@layout:comb] record [
    address                     : address;
    collateralBalanceLedger     : collateralBalanceLedgerType;     // tez/token balance
    usdmOutstanding             : usdmAmountType;                  // nat 
]

type targetLedgerType               is map(string, nat)
type driftLedgerType                is map(string, int)
type lastDriftUpdateLedgerType      is map(string, timestamp)
type cfmmAddressesType              is map(string, address)

// ----- storage types end -----


// ----- types for entrypoint actions begin -----

type setAddressesActionType is [@layout:comb] record [
    cfmmAddress                 : address; 
    usdmTokenAddress            : address; 
]

type tokenAmountLedgerType is map(string, tokenAmountType)
type createVaultActionType is [@layout:comb] record [
    id                          : nat; 
    delegate                    : option(key_hash); 
    depositors                  : depositorsType;
    tokenAmountLedger           : tokenAmountLedgerType;
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

type cfmmPriceActionType is record [ 
    pairName      : string;
    cashAmount    : nat; 
    tokenAmount   : nat; 
]

type registerDepositType is [@layout:comb] record [
    handle      : vaultHandleType; 
    amount      : nat;
    tokenName   : string;
]

// ----- types for entrypoint actions end -----

type controllerStorage is [@layout:comb] record [
    admin                       : address;
    whitelistTokenContracts     : whitelistTokenContractsType;      
    vaults                      : big_map(vaultHandleType, vaultType);

    targetLedger                : targetLedgerType;
    driftLedger                 : driftLedgerType;
    lastDriftUpdateLedger       : lastDriftUpdateLedgerType;
    collateralTokenLedger       : collateralTokenLedgerType;

    usdmTokenAddress            : address;            // USDM token contract address
    cfmmAddresses               : cfmmAddressesType;  // map of CFMM addresss providing the price feed
]

type controllerAction is 
    | UpdateWhitelistTokenContracts  of updateWhitelistTokenContractsParams
    | SetAddresses                   of setAddressesActionType

    | CfmmPrice                      of cfmmPriceActionType

    | CreateVault                    of createVaultActionType
    | WithdrawFromVault              of withdrawFromVaultActionType
    | LiquidateVault                 of liquidateVaultActionType

    | RegisterDeposit                of registerDepositType
    | MintOrBurn                     of mintOrBurnActionType
    | GetTarget                      of contract(nat)

// todo: add markForLiquidation entrypoint -> for grace period of 10 minutes before

const noOperations : list (operation) = nil;
type return is list (operation) * controllerStorage


// ----- constants begin -----

const zeroAddress          : address  = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);
const fixedPointAccuracy   : nat      = 1_000_000_000_000_000_000_000_000n // 10^24 - // for use in division

// ----- constants end -----


// multi-asset vault
#include "vault.ligo"

// helper functions - conversions
function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;

// helper function - check sender is admin
function checkSenderIsAdmin(var s : controllerStorage) : unit is
  if (Tezos.sender = s.admin) then unit
  else failwith("Error. Only the administrator can call this entrypoint.");

// helper function to get vaultWithdraw entrypoint
function getVaultWithdrawEntrypoint(const vaultAddress : address) : contract(vaultWithdrawType) is
  case (Tezos.get_entrypoint_opt(
      "%vaultWithdraw",
      vaultAddress) : option(contract(vaultWithdrawType))) of
    Some(contr) -> contr
  | None -> (failwith("Error. VaultWithdraw entrypoint in vault not found") : contract(vaultWithdrawType))
  end;

// helper function to get vaultDelegateTez entrypoint
function getVaultDelegateTezEntrypoint(const vaultAddress : address) : contract(vaultDelegateTezType) is
  case (Tezos.get_entrypoint_opt(
      "%vaultDelegateTez",
      vaultAddress) : option(contract(vaultDelegateTezType))) of
    Some(contr) -> contr
  | None -> (failwith("Error. vaultDelegateTez entrypoint in vault not found") : contract(vaultDelegateTezType))
  end;

// helper function to get mintOrBurn entrypoint from USDM contract
function getUsdmMintOrBurnEntrypoint(const tokenContractAddress : address) : contract(mintOrBurnParamsType) is
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

// helper function to create vault 
type createVaultFuncType is (option(key_hash) * tez * vaultStorage) -> (operation * address)
const createVaultFunc : createVaultFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/vault.tz"
        ;
          PAIR } |}
: createVaultFuncType)];


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
    // const isUnderCollaterized : bool  = (15n * vault.collateralBalance) < (Bitwise.shift_right (vault.usdmOutstanding * s.target, 44n));
    skip
} with isUnderCollaterized

function setAddresses(const setAddressesParams : setAddressesActionType; var s : controllerStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    // set usdmTokenAddress and cfmmAddress if they have not been set, otherwise fail 
    // (i.e. they can only be set once after contract origination)
    if s.usdmTokenAddress =/= ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) then 
        failwith("Error. usdmTokenAddress is already set.")
    else if s.cfmmAddress =/= ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) then
        failwith("Error. cfmmAddress is already set.")
    else block {
        s.cfmmAddress      := setAddressesParams.cfmmAddress;
        s.usdmTokenAddress := setAddressesParams.usdmTokenAddress;
    }

} with (noOperations, s)




function cfmmPrice(const cfmmPriceParams : cfmmPriceActionType; var s : controllerStorage) : return is 
block {

    // init variables for convenience
    const tezAmount         : nat               = cfmmPriceParams.cashAmount;
    const tokenAmount       : nat               = cfmmPriceParams.tokenAmount;
    const pairNamne         : string            = cfmmPriceParams.pairName;
    const cfmmAddress       : address           = s.cfmmAddress;

    // check if sender is from the cfmm address
    if Tezos.sender =/= cfmmAddress then failwith("Error. Caller must be CFMM contract.")  else skip;

    var lastDriftUpdate : timestamp := case s.lastDriftUpdateLedger[pairName] of 
          Some(_timestamp) -> _timestamp
        | None -> failwith("Error. LastDriftUpdate not found for this pair.")
    end;

    // check that last drift update is before current time
    if lastDriftUpdate > Tezos.now then failwith("Error. Delta cannot be negative.") else skip;
    const delta   : nat   = abs(Tezos.now - lastDriftUpdate); 

    var target : nat  := case s.targetLedger[pairName] of 
          Some(_nat) -> _nat
        | None -> failwith("Error. Target not found for this pair.")
    end;

    var drift : int  := case s.driftLedger[pairName] of 
          Some(_int) -> _int
        | None -> failwith("Error. Drift not found for this pair.")
    end;

    var d_target  : nat  := (target * abs(drift) * delta) / fixedPointAccuracy;

    target := if drift < 0 then abs(target - d_target) else target + d_target;

    var price            : nat   := (tezAmount * fixedPointAccuracy) / tokenAmount;
    var targetLessPrice  : int   := target - price;

    const x              : nat    = (abs(targetLessPrice * targetLessPrice) / fixedPointAccuracy);
    const priceSquared   : nat    = price * price; 
    const d_drift        : nat    = if x > priceSquared then delta else delta / priceSquared;

    var drift            : int    := if targetLessPrice > 0 then drift + d_drift else drift - d_drift;

    s.targetLedger[pairName] := target;
    s.driftLedger[pairName]  := drift;
    s.lastDriftUpdateLedger  := Tezos.now;

    // math probably not correct with the divisions - double check with checker formula

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

    // params for vault with tez storage origination
    const originateVaultStorage : vaultStorage = record [
        admin                       = Tezos.self_address;
        handle                      = handle;
        depositors                  = createParams.depositors;
        collateralTokenLedger       = s.collateralTokenLedger;
    ];

    // originate vault func
    const vaultOrigination : (operation * address) = createVaultFunc(
        (None : option(key_hash)), 
        Tezos.amount,
        originateVaultStorage
    );

    // add vaultWithTezOrigination operation to operations list
    operations := vaultOrigination.0 # operations; 

    // create new vault params
    if mutezToNatural(Tezos.amount) > 0n then block {
        
        // tez is sent
        const collateralBalanceLedgerMap : collateralBalanceLedgerType = map[
            ("tez" : string) -> mutezToNatural(Tezos.amount)
        ];
        const vault : vaultType = record [
            address                    = vaultWithTezOrigination.1; // vault address
            collateralBalanceLedger    = collateralBalanceLedgerMap;
            collateralTokenLedger      = s.collateralTokenLedger;
            usdmOutstanding            = 0n;
        ];

    } else block {
        // no tez is sent
        const emptyCollateralBalanceLedgerMap : collateralBalanceLedgerType = map[];
        const vault : vaultType = record [
            address                    = vaultWithTezOrigination.1; // vault address
            collateralBalanceLedger    = emptyCollateralBalanceLedgerMap;
            collateralTokenLedger      = s.collateralTokenLedger;
            usdmOutstanding            = 0n;
        ];

    };

    // update controller storage with new vault
    s.vaults := Big_map.update(handle, Some(vault), s.vaults);

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
function registerDeposit(const registerDepositParams : registerDepositType; var s : controllerStorage) : return is 
block {

    // init variables for convenience
    const vaultHandle     : vaultHandleType   = registerDepositParams.handle;
    const depositAmount   : nat               = registerDepositParams.amount;
    const tokenName       : string            = registerDepositType.tokenName;

    const initiator       : vaultOwnerType    = Tezos.sender;

    // get token 
    const collateralToken : collateralTokenRecord = case s.collateralTokenLedger[tokenName] of 
        Some(_record) -> _record
        | None -> failwith("Error. Collateral Token Record not found in collateralTokenLedger.")
    end;

    // if tez is sent, check that Tezos amount should be the same as deposit amount
    if tokenName = "tez" then block {
        if mutezToNatural(Tezos.amount) =/= depositAmount then failwith("Error. Tezos amount and deposit amount do not match.") else skip;
    } else skip;

    // get vault
    var _vault : vaultType := getVault(vaultHandle, s);

    // check if sender matches vault owner; if match, then update and save vault with new collateral balance
    if _vault.address =/= initiator then failwith("Error. Sender does not match vault owner address.") else skip;
    
    // get token collateral balance in vault
    var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of
          Some(_balance) -> _balance
        | None -> 0n
    end;

    const newCollateralBalance : nat = vaultTokenCollateralBalance + depositAmount;

    // // calculate new collateral balance with deposit amount
    // const newCollateralBalance : nat = _vault.collateralBalance + mutezToNatural(depositAmount);

    // // update and save vault with new collateral balance
    // _vault.collateralBalance := newCollateralBalance;
    // s.vaults[vaultHandle]    := _vault;

    
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
        
        if quantity > _vault.usdmOutstanding then failwith("Error. Cannot burn more than outstanding amount of USDM.") else skip;

        const vaultCollateralBalance : nat = _vault.collateralBalance;
        
        const remainingUsdm     : usdmAmountType = abs(_vault.usdmOutstanding - quantity);

        (* get 32/31 of the target price, meaning there is a 1/31 penalty (3.23%) for the oven owner for being liquidated *)
        const extractedBalance  : nat = (quantity * target * fixedPointAccuracy) / (31n * fixedPointAccuracy); // double check maths

        // calculate new vault collateral balance
        const newCollateralBalance : nat = abs(vaultCollateralBalance - extractedBalance);

        // save and update new vault params - usdmOutstanding and collateral
        _vault.usdmOutstanding    := remainingUsdm;
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

        // operation to burn USDM
        const burnUsdmOperationParams : mintOrBurnParamsType = (-quantity, initiator);
        const burnUsdmOperation : operation = Tezos.transaction(
            burnUsdmOperationParams,
            0mutez,
            getUsdmMintOrBurnEntrypoint(s.usdmTokenAddress)
        );
        operations := burnUsdmOperation # operations;

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

    // check if quantity to burn exceeds vault's usdmOutstanding
    if vault.usdmOutstanding + quantity < 0 then failwith("Error. Cannot burn more than outstanding amount of USDM.") else skip;
    const newusdmOutstanding : usdmAmountType = abs(vault.usdmOutstanding + quantity); 
    vault.usdmOutstanding := newusdmOutstanding;
    s.vaults[vaultHandle] := vault;

    // check if vault is undercollaterized; if it is not, then create and send mintOrBurn operation to USDM Token Contract
    if isUnderCollaterized(vault, s) then failwith("Error. Excessive USDM minting and vault will be undercollaterized.")
    else block {

        // create and send mintOrBurn operation to USDM Token Contract
        const usdmMintOrBurnParams : mintOrBurnParamsType = (quantity, initiator);
        const mintOrBurnOperation : operation = Tezos.transaction(
            usdmMintOrBurnParams,
            0mutez,
            getUsdmMintOrBurnEntrypoint(s.usdmTokenAddress)
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