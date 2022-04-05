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

// type collateralTokenAddressesType is map(address, string) // token collateral address : name of token collateral

type collateralBalanceLedgerType  is map(collateralNameType, tokenBalanceType) // to keep record of token collateral (tez/token)
type collateralTokenRecordType is [@layout:comb] record [
    tokenContractAddress    : address;
    tokenType               : tokenType; // from vaultType.ligo partial - Tez, FA12, FA2
]
type collateralTokenLedgerType is map(string, collateralTokenRecordType) 

type vaultType is [@layout:comb] record [
    address                     : address;
    collateralBalanceLedger     : collateralBalanceLedgerType;           // tez/token balance
    usdmOutstanding             : usdmAmountType;                        // nat 
    collateralTokenAddresses         : collateralTokenAddressesType;     // token collateral address : name of token collateral
    // markedForLiquidation        : bool;                            // marked for liquidation
    // timeMarkedForLiquidation    : timestamp;                       // time marked for liquidation
]

// owner types
type ownerVaultSetType              is set(vaultIdType)                     // set of vault ids belonging to the owner 
type ownerLedgerType                is big_map(address, ownerVaultSetType)  // big map of owners, and the corresponding vaults they own
type vaultLedgerType                is big_map(vaultIdType, bool);

// price and token types
type targetLedgerType               is map(string, nat)
type driftLedgerType                is map(string, int)
type lastDriftUpdateLedgerType      is map(string, timestamp)
type cfmmAddressLedgerType          is map(string, address)
type priceLedgerType                is map(string, nat)

// ----- storage types end -----


// ----- types for entrypoint actions begin -----

type setUsdmAddressActionType is [@layout:comb] record [
    usdmTokenAddress            : address; 
]

type setCfmmAddressActionType is [@layout:comb] record [
    tokenName                   : string;
    cfmmAddress                 : address; 
]

type updateCollateralTokenLedgerActionType is [@layout:comb] record [
    tokenName                   : string;
    tokenContractAddress        : address;
    tokenType                   : tokenType;
]

type updateVaultTokenAddressesActionType is [@layout:comb] record [
    handle                      : vaultHandleType; 
]

type tokenAmountLedgerType is map(string, tokenAmountType)
type createVaultActionType is [@layout:comb] record [
    delegate                    : option(key_hash); 
    depositors                  : depositorsType;
]

type withdrawFromVaultActionType is [@layout:comb] record [
    id                          : vaultIdType; 
    tokenAmount                 : nat;  
    tokenName                   : string;
    // [@annot:to] to_             : contract(unit);
]

type liquidateVaultActionType is [@layout:comb] record [
    handle                      : vaultHandleType; 
    usdmQuantity                : nat; 
    [@annot:to] to_             : contract(unit);
]

type mintOrBurnActionType is [@layout:comb] record [ 
    id          : nat; 
    quantity    : int;
]

type onPriceActionType is record [ 
    tokenName     : string;
    cashAmount    : nat; 
    tokenAmount   : nat; 
]

type registerDepositType is [@layout:comb] record [
    handle      : vaultHandleType; 
    amount      : nat;
    tokenName   : string;
]

type configType is [@layout:comb] record [
    collateralRatio           : nat;    // collateral ratio
    liquidationRatio          : nat;    // liquidation ratio
    decimals                  : nat;    // decimals 
]

type getTargetActionType is [@layout:comb] record [
    tokenName           : string;
    callbackContract    : contract(nat);
]


// ----- types for entrypoint actions end -----

type controllerStorage is [@layout:comb] record [
    admin                       : address;
    config                      : configType;
    
    usdmTokenAddress            : address;                // USDM token contract address
    whitelistTokenContracts     : whitelistTokenContractsType;      

    // vaults and owners
    vaults                      : big_map(vaultHandleType, vaultType);
    vaultCounter                : vaultIdType;      // nat
    vaultLedger                 : vaultLedgerType;  // used to check if vault id is in use already
    ownerLedger                 : ownerLedgerType;

    // price, tokens and cfmm
    targetLedger                : targetLedgerType;
    driftLedger                 : driftLedgerType;
    lastDriftUpdateLedger       : lastDriftUpdateLedgerType;
    collateralTokenLedger       : collateralTokenLedgerType;
    priceLedger                 : priceLedgerType;
    cfmmAddressLedger           : cfmmAddressLedgerType;  // map of CFMM addresss providing the price feed
]

type controllerAction is 
    | Default of unit
    | UpdateWhitelistTokenContracts  of updateWhitelistTokenContractsParams
    | UpdateCollateralTokenLedger    of updateCollateralTokenLedgerActionType

    | SetUsdmAddress                 of setUsdmAddressActionType

    | OnPriceAction                  of onPriceActionType

    | CreateVault                    of createVaultActionType
    | WithdrawFromVault              of withdrawFromVaultActionType
    
    | LiquidateVault                 of liquidateVaultActionType

    | RegisterDeposit                of registerDepositType
    | MintOrBurn                     of mintOrBurnActionType
    | GetTarget                      of getTargetActionType

const noOperations : list (operation) = nil;
type return is list (operation) * controllerStorage


// ----- constants begin -----

const zeroAddress            : address  = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);
const fixedPointAccuracy     : nat      = 1_000_000_000_000_000_000_000_000n;  // 10^24     - // for use in division
const tezFixedPointAccuracy  : nat      = 1_000_000_000_000_000_000n;           // 10^18    - // for use in division with tez

// ----- constants end -----


// multi-asset vault
#include "u_vault.ligo"

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






function checkInCollateralTokenLedger(const collateralTokenRecord : collateralTokenRecordType; var s : controllerStorage) : bool is 
block {
  var inCollateralTokenLedgerMap : bool := False;
  for _key -> value in map s.collateralTokenLedger block {
    if collateralTokenRecord = value then inCollateralTokenLedgerMap := True
      else skip;
  }  
} with inCollateralTokenLedgerMap


(* UpdateCollateralTokenLedger Entrypoint *)
function updateCollateralTokenLedger(const updateCollateralTokenLedgerParams: updateCollateralTokenLedgerActionType; var s : controllerStorage) : return is 
  block{

    checkSenderIsAdmin(s); // check that sender is admin

    const tokenName             : string    = updateCollateralTokenLedgerParams.tokenName;
    const tokenContractAddress  : address   = updateCollateralTokenLedgerParams.tokenContractAddress;
    const tokenType             : tokenType = updateCollateralTokenLedgerParams.tokenType;
    
    const collateralTokenRecord : collateralTokenRecordType = record [
        tokenContractAddress = tokenContractAddress;
        tokenType            = tokenType;
    ];

    const existingToken: option(collateralTokenRecordType) = 
      if checkInCollateralTokenLedger(collateralTokenRecord, s) then (None : option(collateralTokenRecordType)) else Some (collateralTokenRecord);

    const updatedCollateralTokenLedger : collateralTokenLedgerType = 
      Map.update(
        tokenName, 
        existingToken,
        s.collateralTokenLedger
      );

    s.collateralTokenLedger := updatedCollateralTokenLedger

  } with (noOperations, s) 

  

// helper function to create vault 
type createVaultFuncType is (option(key_hash) * tez * vaultStorage) -> (operation * address)
const createVaultFunc : createVaultFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/u_vault.tz"
        ;
          PAIR } |}
: createVaultFuncType)];


// helper function to get vault
function getVault(const handle : vaultHandleType; var s : controllerStorage) : vaultType is 
block {
    var vault : vaultType := case s.vaults[handle] of 
        Some(_vault) -> _vault
        | None -> failwith("Error. Vault not found.")
    end;
} with vault



// helper function to check if vault is under collaterized
function isUnderCollaterized(const vault : vaultType; var s : controllerStorage) : bool is 
block {
    
    // initialise variables - vaultCollateralValue and usdmOutstanding
    var vaultCollateralValue        : nat  := 0n;
    const usdmOutstanding           : nat  = vault.usdmOutstanding;    
    const collateralRatio           : nat  = s.config.collateralRatio;  // default 3000n: i.e. 3x
    // const decimals                  : nat  = s.config.decimals;         // default 3n (decimals): i.e. divide by 10 ^ 3

    for tokenName -> tokenBalance in map vault.collateralBalanceLedger block {
        
        if tokenName = "tez" then block {

            // calculate value of tez balance with same fixed point accuracy as price
            const tezValueWithFixedPointAccuracy : nat = tokenBalance * tezFixedPointAccuracy;

            // increment vault collateral value
            vaultCollateralValue := vaultCollateralValue + tezValueWithFixedPointAccuracy;
            
        } else block {

            // get price of token in xtz
            const tokenPrice : nat = case s.priceLedger[tokenName] of 
                Some(_price) -> _price
                | None -> failwith("Error. Price not found for token.")
            end;

            // calculate value of collateral balance
            const tokenValueInXtz : nat = tokenBalance * tokenPrice; 

            // increment vault collateral value
            vaultCollateralValue := vaultCollateralValue + tokenValueInXtz;

        };
    };

    // get price of USDM in xtz
    const usdmTokenPrice : nat = case s.priceLedger["usdm"] of 
        Some(_price) -> _price
        | None -> failwith("Error. Price not found for USDM Token.")
    end;

    const usdmOutstandingValueInXtz : nat = usdmOutstanding * usdmTokenPrice;

    // todo: adjust later for 300% collateral check
    const isUnderCollaterized : bool = vaultCollateralValue < abs( (collateralRatio * usdmOutstandingValueInXtz) / (100000) );
    
    // const isUnderCollaterized : bool  = (15n * vault.collateralBalance) < (Bitwise.shift_right (vault.usdmOutstanding * s.target, 44n)); 

} with isUnderCollaterized




(* setUsdmAddress entrypoint *)
function setUsdmAddress(const setUsdmAddressParams : setUsdmAddressActionType; var s : controllerStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    // set usdmTokenAddress and cfmmAddress if they have not been set, otherwise fail 
    // (i.e. they can only be set once after contract origination)
    if s.usdmTokenAddress =/= ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) then 
        failwith("Error. usdmTokenAddress is already set.")
    else block {
        s.usdmTokenAddress := setUsdmAddressParams.usdmTokenAddress;
    }

} with (noOperations, s)




(* onPriceAction entrypoint *)
function onPriceAction(const onPriceActionParams : onPriceActionType; var s : controllerStorage) : return is 
block {

    // init variables for convenience
    const cashAmount        : nat               = onPriceActionParams.cashAmount;
    const tokenAmount       : nat               = onPriceActionParams.tokenAmount;
    const tokenName         : string            = onPriceActionParams.tokenName;

    const cfmmAddress : address = case s.cfmmAddressLedger[tokenName] of 
        Some(_address) -> _address
        | None -> failwith("Error. CFMM Address not found in CFMM Ledger.")
    end;

    // check if sender is from the cfmm address
    if Tezos.sender =/= cfmmAddress then failwith("Error. Caller must be CFMM contract.")  else skip;

    var lastDriftUpdate : timestamp := case s.lastDriftUpdateLedger[tokenName] of 
          Some(_timestamp) -> _timestamp
        | None -> failwith("Error. LastDriftUpdate not found for this pair.")
    end;

    // check that last drift update is before current time
    if lastDriftUpdate > Tezos.now then failwith("Error. Delta cannot be negative.") else skip;
    const delta   : nat   = abs(Tezos.now - lastDriftUpdate); 

    var target : nat  := case s.targetLedger[tokenName] of 
          Some(_nat) -> _nat
        | None -> failwith("Error. Target not found for this pair.")
    end;

    var drift : int  := case s.driftLedger[tokenName] of 
          Some(_int) -> _int
        | None -> failwith("Error. Drift not found for this pair.")
    end;

    var d_target  : nat  := (target * abs(drift) * delta) / fixedPointAccuracy;

    target := if drift < 0 then abs(target - d_target) else target + d_target;

    const price            : nat   = (cashAmount * fixedPointAccuracy) / tokenAmount;
    const targetLessPrice  : int   = target - price;

    const x                : nat    = (abs(targetLessPrice * targetLessPrice) / fixedPointAccuracy);
    const priceSquared     : nat    = price * price; 
    const d_drift          : nat    = if x > priceSquared then delta else delta / priceSquared;

    var drift              : int    := if targetLessPrice > 0 then drift + d_drift else drift - d_drift;

    s.targetLedger[tokenName]            := target;
    s.driftLedger[tokenName]             := drift;
    s.lastDriftUpdateLedger[tokenName]   := Tezos.now;
    s.priceLedger[tokenName]             := price;           

    // math probably not correct with the divisions - double check with checker formula

} with (noOperations, s)




(* createVault entrypoint *)
function createVault(const createParams : createVaultActionType ; var s : controllerStorage) : return is 
block {
    
    // change from ctez with inclusion of a vault counter
    
    // get vault counter
    const newVaultId : vaultIdType = s.vaultCounter;
    
    // check if vault id already exists
    if Big_map.mem(newVaultId, s.vaultLedger) then failwith("Error. Vault Id already exists.") else skip;
    
    // make vault handle
    const handle : vaultHandleType = record [
        id     = newVaultId;
        owner  = Tezos.sender;
    ];

    // check if vault already exists
    if Big_map.mem(handle, s.vaults) then failwith("Error. Vault already exists.") else skip;

    // init operations
    var operations : list(operation) := nil;

    const collateralTokenAddressesMap : collateralTokenAddressesType = map[];

    // params for vault with tez storage origination
    const originateVaultStorage : vaultStorage = record [
        admin                       = Tezos.self_address;
        handle                      = handle;
        depositors                  = createParams.depositors;
        collateralTokenAddresses    = collateralTokenAddressesMap;
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
            address                    = vaultOrigination.1; // vault address
            collateralBalanceLedger    = collateralBalanceLedgerMap;
            collateralTokenAddresses   = collateralTokenAddressesMap;
            usdmOutstanding            = 0n;
        ];
        
        // update controller storage with new vault
        s.vaults := Big_map.update(handle, Some(vault), s.vaults);

    } else block {
        // no tez is sent
        const emptyCollateralBalanceLedgerMap : collateralBalanceLedgerType = map[];
        const vault : vaultType = record [
            address                    = vaultOrigination.1; // vault address
            collateralBalanceLedger    = emptyCollateralBalanceLedgerMap;
            collateralTokenAddresses   = collateralTokenAddressesMap;
            usdmOutstanding            = 0n;
        ];

        // update controller storage with new vault
        s.vaults := Big_map.update(handle, Some(vault), s.vaults);

    };

    // increment vault counter and add vault id to vaultLedger
    s.vaultLedger[newVaultId] := True;
    s.vaultCounter            := s.vaultCounter + 1n;

} with (operations, s)




(* withdrawFromVault entrypoint *)
function withdrawFromVault(const withdrawParams : withdrawFromVaultActionType; var s : controllerStorage) : return is 
block {

    // init variables for convenience
    const vaultId                : vaultIdType       = withdrawParams.id; 
    const withdrawTokenAmount    : nat               = withdrawParams.tokenAmount;
    const tokenName              : string            = withdrawParams.tokenName;
    // const recipient              : contract(unit)    = withdrawParams.to_;
    const recipient              : address           = Tezos.sender;
    const initiator              : vaultOwnerType    = Tezos.sender;
    var operations               : list(operation)  := nil;

    // make vault handle
    const vaultHandle : vaultHandleType = record [
        id     = vaultId;
        owner  = initiator;
    ];

    // get vault
    var vault : vaultType := getVault(vaultHandle, s);

    // if tez is to be withdrawn, check that Tezos amount should be the same as withdraw amount
    if tokenName = "tez" then block {
        if mutezToNatural(Tezos.amount) =/= withdrawTokenAmount then failwith("Error. Tezos amount and withdraw token amount do not match.") else skip;
    } else skip;

    // get token collateral balance in vault, fail if none found
    var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of
          Some(_balance) -> _balance
        | None -> failwith("Error. You do not have any tokens to withdraw.")
    end;

    // calculate new vault balance
    if withdrawTokenAmount > vaultTokenCollateralBalance then failwith("Error. Token withdrawal amount cannot be greater than your collateral balance.") else skip;
    const newCollateralBalance : nat  = abs(vaultTokenCollateralBalance - withdrawTokenAmount);

    // check if vault is undercollaterized, if not then send withdraw operation
    if isUnderCollaterized(vault, s) then failwith("Error. Withdrawal is not allowed as vault is undercollaterized.") else skip;
    
    // get collateral token record - with token contract address and token type
    const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of 
          Some(_collateralTokenRecord) -> _collateralTokenRecord
        | None -> failwith("Error. Collateral Token Record not found in collateral token ledger.")
    end;

    // pattern match withdraw operation based on token type
    const withdrawOperation : operation = case collateralTokenRecord.tokenType of
        
        Tez(_tez) -> block {
            
            const withdrawTezOperationParams : vaultWithdrawType = record [
                from_ = vault.address;
                to_   = recipient; 
                amt   = withdrawTokenAmount;
                token = Tez(_tez);
            ];
            const withdrawTezOperation : operation = Tezos.transaction(
                withdrawTezOperationParams,
                0mutez,
                getVaultWithdrawEntrypoint(vault.address)
            );

        } with withdrawTezOperation

        | Fa12(_token) -> block {

            const withdrawFa12OperationParams : vaultWithdrawType = record [
                from_ = vault.address;
                to_   = recipient; 
                amt   = withdrawTokenAmount;
                token = Fa12(_token);
            ];
            const withdrawFa12Operation : operation = Tezos.transaction(
                withdrawFa12OperationParams,
                0mutez,
                getVaultWithdrawEntrypoint(vault.address)
            );

        } with withdrawFa12Operation

        | Fa2(_token) -> block {

            const withdrawFa2OperationParams : vaultWithdrawType = record [
                from_ = vault.address;
                to_   = recipient; 
                amt   = withdrawTokenAmount;
                token = Fa2(_token);
            ];
            const withdrawFa2Operation : operation = Tezos.transaction(
                withdrawFa2OperationParams,
                0mutez,
                getVaultWithdrawEntrypoint(vault.address)
            );

        } with withdrawFa2Operation

    end;

    operations := withdrawOperation # operations;

    // save and update new balance for collateral token
    vault.collateralBalanceLedger[tokenName] := newCollateralBalance;
    s.vaults[vaultHandle]                     := vault;

} with (operations, s)




(* registerDeposit entrypoint *)
function registerDeposit(const registerDepositParams : registerDepositType; var s : controllerStorage) : return is 
block {

    // init variables for convenience
    const vaultHandle     : vaultHandleType   = registerDepositParams.handle;
    const depositAmount   : nat               = registerDepositParams.amount;
    const tokenName       : string            = registerDepositParams.tokenName;

    const initiator       : vaultOwnerType    = Tezos.sender;

    // check if tez or token is sent
    // if tokenName = "tez" then block {

    //     // if tez is sent, check that Tezos amount should be the same as deposit amount
    //     if mutezToNatural(Tezos.amount) =/= depositAmount then failwith("Error. Tezos amount and deposit amount do not match.") else skip;

    // } else block {

    //     // get token 
    //     const _collateralToken : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of 
    //         Some(_record) -> _record
    //         | None -> failwith("Error. Collateral Token Record not found in collateralTokenLedger.")
    //     end;
    // };

    if tokenName =/= "tez" then block {
        
        // get token 
        const _collateralToken : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of 
            Some(_record) -> _record
            | None -> failwith("Error. Collateral Token Record not found in collateralTokenLedger.")
        end;

    } else skip;

    // get vault
    var vault : vaultType := getVault(vaultHandle, s);

    // check if sender matches vault owner; if match, then update and save vault with new collateral balance
    if vault.address =/= initiator then failwith("Error. Sender does not match vault owner address.") else skip;
    
    // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
    var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of
          Some(_balance) -> _balance
        | None -> 0n
    end;

    // calculate new collateral balance
    const newCollateralBalance : nat = vaultTokenCollateralBalance + depositAmount;

    // save and update new balance for collateral token
    vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
    s.vaults[vaultHandle]                     := vault;

} with (noOperations, s)




(* liquidateVault entrypoint *)
function liquidateVault(const liquidateParams : liquidateVaultActionType; var s : controllerStorage) : return is 
block {
    
    // init variables for convenience
    const vaultHandle       : vaultHandleType         = liquidateParams.handle; 
    const usdmQuantity      : nat                     = liquidateParams.usdmQuantity;

    // const recipient         : contract(unit)          = liquidateParams.to_;
    const recipient         : address                 = Tezos.sender;
    const initiator         : initiatorAddressType    = Tezos.sender;
    
    var operations          : list(operation)        := nil;

    // get vault
    var _vault : vaultType := getVault(vaultHandle, s);

    // check if vault is under collaterized
    if isUnderCollaterized(_vault, s) then skip else failwith("Error. Vault is not undercollaterized and cannot be liquidated.");

    // check if there is sufficient usdmOutstanding, and calculate remaining usdm after liquidation
    if usdmQuantity > _vault.usdmOutstanding then failwith("Error. Cannot burn more than outstanding amount of USDM in vault.") else skip;
    const remainingUsdm : usdmAmountType = abs(_vault.usdmOutstanding - usdmQuantity);

    // get USDM target
    // todo: not used yet
    var _usdmTarget : nat  := case s.targetLedger["usdm"] of 
          Some(_nat) -> _nat
        | None -> failwith("Error. Target not found for USDM.")
    end;

    // get USDM price in xtz
    var usdmPriceInXtz : nat  := case s.priceLedger["usdm"] of 
          Some(_nat) -> _nat
        | None -> failwith("Error. Price not found for USDM.")
    end;

    // todo: fix extracted balance amount
    (* get 32/31 of the target price, meaning there is a 1/31 penalty (3.23%) for the oven owner for being liquidated *)
    // const totalExtractedBalance : nat = (usdmQuantity * usdmTarget * fixedPointAccuracy) / (31n * fixedPointAccuracy); 

    const totalValueToBeLiquidated : nat = usdmQuantity * usdmPriceInXtz;
        
    // get total vault collateral value
    var vaultCollateralValue      : nat := 0n;
    for tokenName -> tokenBalance in map _vault.collateralBalanceLedger block {
        
        if tokenName = "tez" then block {

            // calculate value of tez balance with same fixed point accuracy as price
            const tezValueWithFixedPointAccuracy : nat = tokenBalance * tezFixedPointAccuracy;

            // increment vault collateral value
            vaultCollateralValue := vaultCollateralValue + tezValueWithFixedPointAccuracy;
            
        } else block {

            // get price of token in xtz
            const tokenPrice : nat = case s.priceLedger[tokenName] of 
                Some(_price) -> _price
                | None -> failwith("Error. Price not found for token.")
            end;

            // calculate value of collateral balance
            const tokenValueInXtz : nat = tokenBalance * tokenPrice; 

            // increment vault collateral value
            vaultCollateralValue := vaultCollateralValue + tokenValueInXtz;

        };
    };

    
    // loop tokens in vault collateral balance ledger to be liquidated
    var _extractedBalanceTracker   : nat := 0n;
    for tokenName -> tokenBalance in map _vault.collateralBalanceLedger block {

        // skip if token balance is 0n
        if tokenBalance = 0n then skip else block {

            // get collateral token record - with token contract address and token type
            const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of 
                Some(_collateralTokenRecord) -> _collateralTokenRecord
                | None -> failwith("Error. Collateral Token Record not found in collateral token ledger.")
            end;

            // get price of token in xtz
            const tokenPrice : nat = case s.priceLedger[tokenName] of 
                Some(_price) -> _price
                | None -> failwith("Error. Price not found for token.")
            end;

            // calculate value of collateral balance
            const tokenValueInXtz : nat = tokenBalance * tokenPrice; 

            // increment extracted balance
            _extractedBalanceTracker := _extractedBalanceTracker + tokenValueInXtz;

            // get proportion of collateral balance against total collateral value
            const tokenProportion : nat = tokenValueInXtz * fixedPointAccuracy / vaultCollateralValue;

            // get balance to be extracted from token
            const tokenProportionalLiquidationValue : nat = tokenProportion * totalValueToBeLiquidated;

            // get quantity of tokens to be liquidated
            const tokenQuantityToBeLiquidated : nat = (tokenProportionalLiquidationValue / tokenPrice) / fixedPointAccuracy;

            // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
            var vaultTokenCollateralBalance : nat := case _vault.collateralBalanceLedger[tokenName] of
                Some(_balance) -> _balance
                | None -> 0n
            end;

            // calculate new collateral balance
            if tokenQuantityToBeLiquidated > vaultTokenCollateralBalance then failwith("Error. Token quantity to be liquidated cannot be more than balance of token collateral in vault.") else skip;
            const newTokenCollateralBalance : nat = abs(vaultTokenCollateralBalance - tokenQuantityToBeLiquidated);

            // send collateral to initiator of liquidation: pattern match withdraw operation based on token type
            const initiatorTakeCollateralOperation : operation = case collateralTokenRecord.tokenType of
                Tez(_tez) -> block {
                    
                    const withdrawTezOperationParams : vaultWithdrawType = record [
                        from_ = _vault.address;
                        to_   = recipient; 
                        amt   = tokenQuantityToBeLiquidated;
                        token = Tez(_tez);
                    ];
                    const withdrawTezOperation : operation = Tezos.transaction(
                        withdrawTezOperationParams,
                        0mutez,
                        getVaultWithdrawEntrypoint(_vault.address)
                    );

                } with withdrawTezOperation
                | Fa12(_token) -> block {

                    const withdrawFa12OperationParams : vaultWithdrawType = record [
                        from_ = _vault.address;
                        to_   = recipient; 
                        amt   = tokenQuantityToBeLiquidated;
                        token = Fa12(_token);
                    ];
                    const withdrawFa12Operation : operation = Tezos.transaction(
                        withdrawFa12OperationParams,
                        0mutez,
                        getVaultWithdrawEntrypoint(_vault.address)
                    );

                } with withdrawFa12Operation
                | Fa2(_token) -> block {

                    const withdrawFa2OperationParams : vaultWithdrawType = record [
                        from_ = _vault.address;
                        to_   = recipient; 
                        amt   = tokenQuantityToBeLiquidated;
                        token = Fa2(_token);
                    ];
                    const withdrawFa2Operation : operation = Tezos.transaction(
                        withdrawFa2OperationParams,
                        0mutez,
                        getVaultWithdrawEntrypoint(_vault.address)
                    );

                } with withdrawFa2Operation
            end;

            operations := initiatorTakeCollateralOperation # operations;

            // save and update new balance for collateral token
            _vault.collateralBalanceLedger[tokenName]  := newTokenCollateralBalance;

        };

    };

    // operation to burn USDM
    const burnUsdmOperationParams : mintOrBurnParamsType = (-usdmQuantity, initiator);
    const burnUsdmOperation : operation = Tezos.transaction(
        burnUsdmOperationParams,
        0mutez,
        getUsdmMintOrBurnEntrypoint(s.usdmTokenAddress)
    );
    operations := burnUsdmOperation # operations;

    // save and update new usdmOutstanding and balance for collateral token
    _vault.usdmOutstanding                    := remainingUsdm;
    s.vaults[vaultHandle]                     := _vault;

} with (operations, s)


// // (* liquidateVault entrypoint *)
// // function liquidateVault(const liquidateParams : liquidateVaultActionType; var s : controllerStorage) : return is 
// // block {
    
// //     // init variables for convenience
// //     const vaultHandle       : vaultHandleType         = liquidateParams.handle; 
// //     const usdmQuantity      : nat                     = liquidateParams.usdmQuantity;
// //     const tokenName         : string                  = liquidateParams.tokenName;

// //     const recipient         : contract(unit)          = liquidateParams.to_;
// //     const initiator         : initiatorAddressType    = Tezos.sender;
    
// //     const target            : nat                     = s.target; 
// //     var operations          : list(operation)        := nil;

// //     // get vault
// //     var _vault : vaultType := getVault(vaultHandle, s);

// //     // check if vault is under collaterized
// //     if isUnderCollaterized(_vault, s) then skip else failwith("Error. Vault is not undercollaterized and cannot be liquidated.");

// //     // check if there is sufficient usdmOutstanding, and calculate remaining usdm after liquidation
// //     if usdmQuantity > _vault.usdmOutstanding then failwith("Error. Cannot burn more than outstanding amount of USDM in vault.") else skip;
// //     const remainingUsdm : usdmAmountType = abs(_vault.usdmOutstanding - usdmQuantity);

// //     // get token collateral balance in vault, fail if none found
// //     var vaultTokenCollateralBalance : nat := case _vault.collateralBalanceLedger[tokenName] of
// //           Some(_balance) -> _balance
// //         | None -> failwith("Error. Vault does not have this token as its collateral.")
// //     end;

// //     // get collateral token record - with token contract address and token type
// //     const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of 
// //           Some(_collateralTokenRecord) -> _collateralTokenRecord
// //         | None -> failwith("Error. Collateral Token Record not found in collateral token ledger.")
// //     end;


// //     // todo: fix extracted balance amount
// //     (* get 32/31 of the target price, meaning there is a 1/31 penalty (3.23%) for the oven owner for being liquidated *)
// //     const extractedBalance  : nat = (usdmQuantity * target * fixedPointAccuracy) / (31n * fixedPointAccuracy); // double check maths

// //     // calculate new vault collateral balance
// //     const newCollateralBalance : nat = abs(vaultTokenCollateralBalance - extractedBalance);

// //     // send collateral to initiator of liquidation: pattern match withdraw operation based on token type
// //     const initiatorTakeCollateralOperation : operation = case collateralTokenRecord.tokenType of
// //         Tez(_tez) -> block {
            
// //             const withdrawTezOperationParams : vaultWithdrawType = record [
// //                 from_ = vault.address;
// //                 to_   = recipient; 
// //                 amt   = extractedBalance;
// //                 token = _tez;
// //             ];
// //             const withdrawTezOperation : operation = Tezos.transaction(
// //                 withdrawTezOperationParams,
// //                 0mutez,
// //                 getVaultWithdrawEntrypoint(vault.address)
// //             );

// //         } with withdrawTezOperation
// //         | FA12(_token) -> block {

// //             const withdrawFa12OperationParams : vaultWithdrawType = record [
// //                 from_ = vault.address;
// //                 to_   = recipient; 
// //                 amt   = extractedBalance;
// //                 token = _token;
// //             ];
// //             const withdrawFa12Operation : operation = Tezos.transaction(
// //                 withdrawTezOperationParams,
// //                 0mutez,
// //                 getVaultWithdrawEntrypoint(vault.address)
// //             );

// //         } with withdrawFa12Operation
// //         | FA2(_token) -> block {

// //             const withdrawFa2OperationParams : vaultWithdrawType = record [
// //                 from_ = vault.address;
// //                 to_   = recipient; 
// //                 amt   = extractedBalance;
// //                 token = _token;
// //             ];
// //             const withdrawFa2Operation : operation = Tezos.transaction(
// //                 withdrawTezOperationParams,
// //                 0mutez,
// //                 getVaultWithdrawEntrypoint(vault.address)
// //             );

// //         } with withdrawFa2Operation
// //     end;

// //     operations := initiatorTakeCollateralOperation # operations;

// //     // operation to burn USDM
// //     const burnUsdmOperationParams : mintOrBurnParamsType = (-usdmQuantity, initiator);
// //     const burnUsdmOperation : operation = Tezos.transaction(
// //         burnUsdmOperationParams,
// //         0mutez,
// //         getUsdmMintOrBurnEntrypoint(s.usdmTokenAddress)
// //     );
// //     operations := burnUsdmOperation # operations;

// //     // save and update new usdmOutstanding and balance for collateral token
// //     _vault.usdmOutstanding                    := remainingUsdm;
// //     _vault.collateralBalanceLedger[tokenName] := newCollateralBalance;
// //     s.vaults[vaultHandle]                     := _vault;

// // } with (operations, s)




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
function getTarget(const getTargetParams : getTargetActionType; var s : controllerStorage) : return is 
block {

    // init variables
    const tokenName          : string         = getTargetParams.tokenName;
    const callbackContract   : contract(nat)  = getTargetParams.callbackContract;

    const target : nat = case s.targetLedger[tokenName] of
        Some(_target) -> _target
        | None -> failwith("Error. No target found in target ledger.")
    end;

    const callbackOperation : operation = Tezos.transaction(
        target,
        0mutez,
        callbackContract
    );

} with (list[callbackOperation], s)




function main (const action : controllerAction; const s : controllerStorage) : return is 
    case action of
        | Default(_params) -> ((nil : list(operation)), s)
        | UpdateWhitelistTokenContracts(parameters)     -> updateWhitelistTokenContracts(parameters, s)
        | UpdateCollateralTokenLedger(parameters)       -> updateCollateralTokenLedger(parameters, s)

        | SetUsdmAddress(parameters)                    -> setUsdmAddress(parameters, s)

        | OnPriceAction(parameters)                     -> onPriceAction(parameters, s)

        | CreateVault(parameters)                       -> createVault(parameters, s)
        | WithdrawFromVault(parameters)                 -> withdrawFromVault(parameters, s)
        
        | LiquidateVault(parameters)                    -> liquidateVault(parameters, s)
        
        | RegisterDeposit(parameters)                   -> registerDeposit(parameters, s)

        | MintOrBurn(parameters)                        -> mintOrBurn(parameters, s)
        | GetTarget(parameters)                         -> getTarget(parameters, s)

    end