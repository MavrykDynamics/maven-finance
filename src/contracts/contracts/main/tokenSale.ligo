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
  | Default             of unit
    
    // Housekeeping Entrypoints
  | SetAdmin            of address
  | UpdateMetadata      of updateMetadataType
  | UpdateConfig        of tokenSaleUpdateConfigActionType

    // Token Sale Entrypoints
  | BuyTokens           of nat
  
  
const noOperations : list (operation) = nil;
type return is list (operation) * tokenSaleStorage



// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                              = 0n;
[@inline] const error_ONLY_SELF_ALLOWED                                       = 1n;
[@inline] const error_ONLY_ADMIN_OR_SELF_ALLOWED                              = 2n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ADDRESS_ALLOWED       = 2n;
[@inline] const error_ONLY_ADMIN_OR_SELF_OR_GOVERNANCE_ADDRESS_ALLOWED        = 0n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                       = 8n;
[@inline] const error_TOKEN_SALE_HAS_NOT_STARTED                              = 8n;

[@inline] const error_SET_ADMIN_ENTRYPOINT_NOT_FOUND                          = 13n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_NOT_FOUND                    = 13n;


[@inline] const error_LAMBDA_NOT_FOUND                                        = 26n;
[@inline] const error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA               = 27n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                 = 27n;


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
      | ConfigMaxAmountCap (_v)               -> s.config.maxAmountCap                   := _v  
  ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Token Sale Entrypoints Begin
// ------------------------------------------------------------------------------

(*  buyTokens entrypoint *)
function buyTokens(const amountInTez : nat; var s : tokenSaleStorage) : return is
block {
    
      checkTokenSaleHasStarted(s);

      // check if tez sent is equal to amount specified
      if Tezos.amount =/= naturalToMutez(amountInTez)
      then failwith("Error. Tez sent is not equal to amountInTez.") 
      else skip;

      var operations : list(operation) := nil;

      // send amount to treasury
      const treasuryContract: contract(unit) = Tezos.get_contract_with_error(s.treasuryAddress, "Error. Treasury Contract not found.");
      const transferAmountToTreasuryOperation : operation = transferTez(treasuryContract, Tezos.amount);

      operations := transferAmountToTreasuryOperation # operations;

      // find or create user token sale record
      var userTokenSaleRecord : tokenSaleRecordType := case s.tokenSaleLedger[Tezos.sender] of [
          Some(_record) -> _record
        | None           -> record [
            amount     = 0n;
            lastBought = Tezos.now;
          ]
      ];

      // update token sale ledger
      userTokenSaleRecord.amount      := userTokenSaleRecord.amount + mutezToNatural(Tezos.amount);
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
        | BuyTokens(parameters)                   -> buyTokens(parameters, s)
        
    ]
