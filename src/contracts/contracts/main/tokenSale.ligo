// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Methods and Types
// ------------------------------------------------------------------------------

// Shared Methods
#include "../partials/shared/sharedMethods.ligo"

// Transfer Methods
#include "../partials/shared/transferMethods.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// TokenSale Types
#include "../partials/contractTypes/tokenSaleTypes.ligo"

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
type return is list (operation) * tokenSaleStorageType



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAdmin(var s : tokenSaleStorageType) : unit is
    if (Tezos.get_sender() = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.get_sender() = Tezos.get_self_address()) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



function checkTokenSaleHasStarted(var s : tokenSaleStorageType) : unit is
    if (s.tokenSaleHasStarted = True) then unit
    else failwith(error_TOKEN_SALE_HAS_NOT_STARTED);



function checkInWhitelistAddresses(const userWalletAddress : address; var s : tokenSaleStorageType) : bool is 
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
[@view] function getAdmin(const _: unit; var s : tokenSaleStorageType) : address is
  s.admin



(* View: get config *)
[@view] function getConfig(const _: unit; var s : tokenSaleStorageType) : tokenSaleConfigType is
  s.config



(* View: get treasury address *)
[@view] function getTreasuryAddress(const _: unit; var s : tokenSaleStorageType) : address is
  s.treasuryAddress



(* View: get treasury address *)
[@view] function getWhitelistedAddressOpt(const userAddress: address; var s : tokenSaleStorageType) : option(bool) is
  Big_map.find_opt(userAddress, s.whitelistedAddresses)



(* View: get token sale record *)
[@view] function getTokenSaleRecordOpt(const userAddress: address; var s : tokenSaleStorageType) : option(tokenSaleRecordType) is
  Big_map.find_opt(userAddress, s.tokenSaleLedger)



(* View: tokenSaleHasStarted *)
[@view] function getTokenSaleHasStarted(const _: unit; var s : tokenSaleStorageType) : bool is
  s.tokenSaleHasStarted



(* View: whitelistAmountTotal *)
[@view] function getWhitelistAmountTotal(const _: unit; var s : tokenSaleStorageType) : nat is
  s.whitelistAmountTotal



(* View: overallAmountTotal *)
[@view] function getOverallAmountTotal(const _: unit; var s : tokenSaleStorageType) : nat is
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
function setAdmin(const newAdminAddress : address; var s : tokenSaleStorageType) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;

} with (noOperations, s)



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : tokenSaleStorageType) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin

    const metadataKey   : string = updateMetadataParams.metadataKey;
    const metadataHash  : bytes  = updateMetadataParams.metadataHash;
    
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

} with (noOperations, s)



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : tokenSaleUpdateConfigActionType; var s : tokenSaleStorageType) : return is 
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
function addToWhitelist(const userAddressList : list(address); var s : tokenSaleStorageType) : return is
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); // check that sender is admin

  // loop to add user addresses to whitelist
  for newUserAddress in list userAddressList block {
    s.whitelistedAddresses[newUserAddress] := True;
  }

} with (noOperations, s)



(*  removeFromWhitelist entrypoint *)
function removeFromWhitelist(const userAddressList : list(address); var s : tokenSaleStorageType) : return is
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); // check that sender is admin

  // loop to remove user addresses from whitelist
  for removeUserAddress in list userAddressList block {
    remove (removeUserAddress : address) from map s.whitelistedAddresses;
  }

} with (noOperations, s)



(*  buyTokens entrypoint *)
function buyTokens(const amountInTez : nat; var s : tokenSaleStorageType) : return is
block {
    
      // check if sale has started
      checkTokenSaleHasStarted(s);

      // check if tez sent is equal to amount specified
      if Tezos.get_amount() =/= naturalToMutez(amountInTez)
      then failwith(error_TEZ_SENT_IS_NOT_EQUAL_TO_AMOUNT_IN_TEZ) 
      else skip;

      // init operations
      var operations : list(operation) := nil;

      // check if whitelist sale has started
      if Tezos.get_now() < s.config.whitelistStartTimestamp then failwith(error_WHITELIST_SALE_HAS_NOT_STARTED) else skip;

      // check if whitelist sale has ended -> proceed to public sale
      if Tezos.get_now() > s.config.whitelistEndTimestamp then skip 
      
      // whitelist sale has started
      else if Tezos.get_now() > s.config.whitelistStartTimestamp then block {

          // check if user is whitelisted
          if checkInWhitelistAddresses(Tezos.get_sender(), s) then skip else failwith(error_USER_IS_NOT_WHITELISTED);

          // find or create whitelist user token sale record
          var whitelistUserTokenSaleRecord : tokenSaleRecordType := case s.tokenSaleLedger[Tezos.get_sender()] of [
              Some(_record) -> _record
            | None           -> record [
                amount     = 0n;
                lastBought = Tezos.get_now();
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
      var userTokenSaleRecord : tokenSaleRecordType := case s.tokenSaleLedger[Tezos.get_sender()] of [
          Some(_record) -> _record
        | None           -> record [
            amount     = 0n;
            lastBought = Tezos.get_now();
          ]
      ];

      // check if max amount per wallet total has been exceeded
      if userTokenSaleRecord.amount + amountInTez > s.config.maxAmountPerWalletTotal then failwith(error_MAX_AMOUNT_PER_WALLET_TOTAL_EXCEEDED) else skip;

      // check if overall max amount cap has been exceeded
      const newOverallAmountTotal : nat = s.overallAmountTotal + amountInTez;
      if newOverallAmountTotal > s.config.overallMaxAmountCap then failwith(error_OVERALL_MAX_AMOUNT_CAP_REACHED) else s.overallAmountTotal := newOverallAmountTotal;

      // send amount to treasury
      const treasuryContract: contract(unit) = Tezos.get_contract_with_error(s.treasuryAddress, "Error. Contract not found at given address");
      const transferAmountToTreasuryOperation : operation = transferTez(treasuryContract, Tezos.get_amount());
      operations := transferAmountToTreasuryOperation # operations;

      // update token sale ledger
      userTokenSaleRecord.amount      := userTokenSaleRecord.amount + amountInTez;
      userTokenSaleRecord.lastBought  := Tezos.get_now();
      s.tokenSaleLedger[Tezos.get_sender()] := userTokenSaleRecord;

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
function main (const action : tokenSaleAction; const s : tokenSaleStorageType) : return is 

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
