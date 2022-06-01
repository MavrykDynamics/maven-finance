// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------




// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// TokenSale Types
#include "../partials/types/tokenSaleTypes.ligo"

// ------------------------------------------------------------------------------

type tokenSaleAction is 

    // Default Entrypoint to Receive Tez
  | Default                     of unit
    
    // Housekeeping Entrypoints
  | SetAdmin                    of address
  | UpdateMetadata              of updateMetadataType
  | UpdateConfig                of tokenSaleUpdateConfigActionType

    // Token Sale Entrypoints
  | AddToWhitelist              of list(address)
  | RemoveFromWhitelist         of list(address)
  | BuyTokens                   of nat
  
  
const noOperations : list (operation) = nil;
type return is list (operation) * tokenSaleStorage



// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
//
// Error Codes End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAdmin(var s : tokenSaleStorage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.sender = Tezos.self_address) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



function checkTokenSaleHasStarted(var s : tokenSaleStorage) : unit is
    if (s.tokenSaleHasStarted = True) then unit
    else failwith(error_TOKEN_SALE_HAS_NOT_STARTED);



function checkInWhitelistAddresses(const userWalletAddress : address; var s : tokenSaleStorage) : bool is 
block {

    var inWhitelistAddressesMap : bool := False;
    if Big_map.mem(userWalletAddress, s.whitelistedAddresses) then inWhitelistAddressesMap := True else inWhitelistAddressesMap := False;

} with inWhitelistAddressesMap



function addToWhitelist (const newUserAddress : address; var whitelistedAddresses : whitelistedAddressesType) : whitelistedAddressesType is {
  whitelistedAddresses [newUserAddress] := True 
} with whitelistedAddresses



function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Transfer Helper Functions Begin
// ------------------------------------------------------------------------------

function transferTez(const to_ : contract(unit); const amt : tez) : operation is Tezos.transaction(unit, amt, to_)

// ------------------------------------------------------------------------------
// Transfer Helper Functions Begin
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function admin(const _: unit; var s : tokenSaleStorage) : address is
  s.admin



(* View: get config *)
[@view] function config(const _: unit; var s : tokenSaleStorage) : tokenSaleConfigType is
  s.config



(* View: get treasury address *)
[@view] function treasuryAddress(const _: unit; var s : tokenSaleStorage) : address is
  s.treasuryAddress



(* View: get treasury address *)
[@view] function whitelistedAddressOpt(const userAddress: address; var s : tokenSaleStorage) : option(bool) is
  Big_map.find_opt(userAddress, s.whitelistedAddresses)



(* View: get token sale record *)
[@view] function tokenSaleRecordOpt(const userAddress: address; var s : tokenSaleStorage) : option(tokenSaleRecordType) is
  Big_map.find_opt(userAddress, s.tokenSaleLedger)



(* View: tokenSaleHasStarted *)
[@view] function tokenSaleHasStarted(const _: unit; var s : tokenSaleStorage) : bool is
  s.tokenSaleHasStarted



(* View: whitelistAmountTotal *)
[@view] function whitelistAmountTotal(const _: unit; var s : tokenSaleStorage) : nat is
  s.whitelistAmountTotal



(* View: overallAmountTotal *)
[@view] function overallAmountTotal(const _: unit; var s : tokenSaleStorage) : nat is
  s.overallAmountTotal

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : tokenSaleStorage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;

} with (noOperations, s)



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : tokenSaleStorage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin

    const metadataKey   : string = updateMetadataParams.metadataKey;
    const metadataHash  : bytes  = updateMetadataParams.metadataHash;
    
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

} with (noOperations, s)



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : tokenSaleUpdateConfigActionType; var s : tokenSaleStorage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); // check that sender is admin

  case updateConfigParams of [
        ConfigMaxWhitelistCount (_v)          -> s.config.maxWhitelistCount              := _v
      | ConfigMaxAmountPerWhitelist (_v)      -> s.config.maxAmountPerWhitelistWallet    := _v  
      | ConfigMaxAmountPerWalletTotal (_v)    -> s.config.maxAmountPerWalletTotal        := _v
      | ConfigWhitelistStartTimestamp (_v)    -> s.config.whitelistStartTimestamp        := _v  
      | ConfigWhitelistEndTimestamp (_v)      -> s.config.whitelistEndTimestamp          := _v  
      | ConfigWhitelistMaxAmountCap (_v)      -> s.config.whitelistMaxAmountCap          := _v  
      | ConfigOverallMaxAmountCap (_v)        -> s.config.overallMaxAmountCap            := _v  
  ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Token Sale Entrypoints Begin
// ------------------------------------------------------------------------------

(*  addToWhitelist entrypoint *)
function addToWhitelist(const userAddressList : list(address); var s : tokenSaleStorage) : return is
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); // check that sender is admin

  // loop to add user addresses to whitelist
  for newUserAddress in list userAddressList block {
    s.whitelistedAddresses[newUserAddress] := True;
  }

} with (noOperations, s)



(*  removeFromWhitelist entrypoint *)
function removeFromWhitelist(const userAddressList : list(address); var s : tokenSaleStorage) : return is
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); // check that sender is admin

  // loop to remove user addresses from whitelist
  for removeUserAddress in list userAddressList block {
    remove (removeUserAddress : address) from map s.whitelistedAddresses;
  }

} with (noOperations, s)



(*  buyTokens entrypoint *)
function buyTokens(const amountInTez : nat; var s : tokenSaleStorage) : return is
block {
    
      // check if sale has started
      checkTokenSaleHasStarted(s);

      // check if tez sent is equal to amount specified
      if Tezos.amount =/= naturalToMutez(amountInTez)
      then failwith(error_TEZ_SENT_IS_NOT_EQUAL_TO_AMOUNT_IN_TEZ) 
      else skip;

      // init operations
      var operations : list(operation) := nil;

      // check if whitelist sale has started
      if Tezos.now < s.config.whitelistStartTimestamp then failwith(error_WHITELIST_SALE_HAS_NOT_STARTED) else skip;

      // check if whitelist sale has ended -> proceed to public sale
      if Tezos.now > s.config.whitelistEndTimestamp then skip 
      
      // whitelist sale has started
      else if Tezos.now > s.config.whitelistStartTimestamp then block {

          // check if user is whitelisted
          if checkInWhitelistAddresses(Tezos.sender, s) then skip else failwith(error_USER_IS_NOT_WHITELISTED);

          // find or create whitelist user token sale record
          var whitelistUserTokenSaleRecord : tokenSaleRecordType := case s.tokenSaleLedger[Tezos.sender] of [
              Some(_record) -> _record
            | None           -> record [
                amount     = 0n;
                lastBought = Tezos.now;
              ]
          ];

          // check if max amount per whitelist wallet has been exceeded
          if whitelistUserTokenSaleRecord.amount + amountInTez > s.config.maxAmountPerWhitelistWallet then failwith(error_MAX_AMOUNT_PER_WHITELIST_WALLET_EXCEEDED) else skip;

          // check if whitelist max amount cap has been exceeded
          const newWhitelistAmountTotal : nat = s.whitelistAmountTotal + amountInTez;
          if newWhitelistAmountTotal > s.config.whitelistMaxAmountCap then failwith(error_WHITELIST_MAX_AMOUNT_CAP_REACHED) else s.whitelistAmountTotal := newWhitelistAmountTotal;
      } 

      // public sale has started      
      else skip;

      // find or create user token sale record
      var userTokenSaleRecord : tokenSaleRecordType := case s.tokenSaleLedger[Tezos.sender] of [
          Some(_record) -> _record
        | None           -> record [
            amount     = 0n;
            lastBought = Tezos.now;
          ]
      ];

      // check if max amount per wallet total has been exceeded
      if userTokenSaleRecord.amount + amountInTez > s.config.maxAmountPerWalletTotal then failwith(error_MAX_AMOUNT_PER_WALLET_TOTAL_EXCEEDED) else skip;

      // check if overall max amount cap has been exceeded
      const newOverallAmountTotal : nat = s.overallAmountTotal + amountInTez;
      if newOverallAmountTotal > s.config.overallMaxAmountCap then failwith(error_OVERALL_MAX_AMOUNT_CAP_REACHED) else s.overallAmountTotal := newOverallAmountTotal;

      // send amount to treasury
      const treasuryContract: contract(unit) = Tezos.get_contract_with_error(s.treasuryAddress, "Error. Contract not found at given address");
      const transferAmountToTreasuryOperation : operation = transferTez(treasuryContract, Tezos.amount);
      operations := transferAmountToTreasuryOperation # operations;

      // update token sale ledger
      userTokenSaleRecord.amount      := userTokenSaleRecord.amount + amountInTez;
      userTokenSaleRecord.lastBought  := Tezos.now;
      s.tokenSaleLedger[Tezos.sender] := userTokenSaleRecord;

} with (operations, s)

// ------------------------------------------------------------------------------
// Token Sale Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : tokenSaleAction; const s : tokenSaleStorage) : return is 

    case action of [

          // Default Entrypoint to Receive Tez
        | Default(_params)                        -> ((nil : list(operation)), s)

          // Housekeeping Entrypoints
        | SetAdmin(parameters)                    -> setAdmin(parameters, s)
        | UpdateMetadata(parameters)              -> updateMetadata(parameters, s)  
        | UpdateConfig(parameters)                -> updateConfig(parameters, s)

          // Token Sale Entrypoints
        | AddToWhitelist(parameters)              -> addToWhitelist(parameters, s)
        | RemoveFromWhitelist(parameters)         -> removeFromWhitelist(parameters, s)
        | BuyTokens(parameters)                   -> buyTokens(parameters, s)
        
    ]
