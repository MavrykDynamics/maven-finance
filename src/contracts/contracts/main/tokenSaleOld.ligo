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
  | ClaimTokens                 of unit
  
  
const noOperations : list (operation) = nil;
type return is list (operation) * tokenSaleStorage


const oneDayInSeconds : int = 86_400;
const oneMonthInSeconds : int = 2_592_000;

const oneDayBlocks : int = s.config.blocksPerMinute * 60 * 24;
const oneMonthBlocks : int = (s.config.blocksPerMinute * 60 * 24) * 30;


// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                              = 0n;
[@inline] const error_ONLY_SELF_ALLOWED                                       = 1n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                       = 2n;

[@inline] const error_SET_ADMIN_ENTRYPOINT_NOT_FOUND                          = 3n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_NOT_FOUND                    = 4n;

[@inline] const error_TEZ_SENT_IS_NOT_EQUAL_TO_AMOUNT_IN_TEZ                  = 5n;
[@inline] const error_TOKEN_SALE_HAS_NOT_STARTED                              = 6n;
[@inline] const error_TOKEN_SALE_HAS_NOT_ENDED                                = 7n;
[@inline] const error_WHITELIST_SALE_HAS_NOT_STARTED                          = 8n;
[@inline] const error_USER_IS_NOT_WHITELISTED                                 = 9n;
[@inline] const error_MAX_AMOUNT_PER_WHITELIST_WALLET_EXCEEDED                = 10n;
[@inline] const error_MAX_AMOUNT_PER_WALLET_TOTAL_EXCEEDED                    = 11n;
[@inline] const error_WHITELIST_MAX_AMOUNT_CAP_REACHED                        = 12n;
[@inline] const error_OVERALL_MAX_AMOUNT_CAP_REACHED                          = 13n;

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
    if (Tezos.get_sender() = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.get_sender() = Tezos.get_self_address()) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



function checkTokenSaleHasStarted(var s : tokenSaleStorage) : unit is
    if (s.tokenSaleHasStarted = True) then unit
    else failwith(error_TOKEN_SALE_HAS_NOT_STARTED);



function checkTokenSaleHasEnded(var s : tokenSaleStorage) : unit is
    if (s.tokenSaleHasEnded = True) then unit
    else failwith(error_TOKEN_SALE_HAS_NOT_ENDED);



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
          if checkInWhitelistAddresses(Tezos.get_sender(), s) then skip else failwith(error_USER_IS_NOT_WHITELISTED);

          // find or create whitelist user token sale record
          var whitelistUserTokenSaleRecord : tokenSaleRecordType := case s.tokenSaleLedger[Tezos.get_sender()] of [
              Some(_record) -> _record
            | None           -> record [
                amountBoughtInTez   = 0n;
                totalClaimed        = 0n;
                lastBought          = Tezos.now;
                lastClaimed         = Tezos.now;
              ]
          ];

          // check if max amount per whitelist wallet has been exceeded
          if whitelistUserTokenSaleRecord.amountBoughtInTez + amountInTez > s.config.maxAmountPerWhitelistWallet then failwith(error_MAX_AMOUNT_PER_WHITELIST_WALLET_EXCEEDED) else skip;

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
            amountBoughtInTez   = 0n;
            totalClaimed        = 0n;
            lastBought          = Tezos.now;
            lastClaimed         = Tezos.now;
          ]
      ];

      // check if max amount per wallet total has been exceeded
      if userTokenSaleRecord.amountBoughtInTez + amountInTez > s.config.maxAmountPerWalletTotal then failwith(error_MAX_AMOUNT_PER_WALLET_TOTAL_EXCEEDED) else skip;

      // check if overall max amount cap has been exceeded
      const newOverallAmountTotal : nat = s.overallAmountTotal + amountInTez;
      if newOverallAmountTotal > s.config.overallMaxAmountCap then failwith(error_OVERALL_MAX_AMOUNT_CAP_REACHED) else s.overallAmountTotal := newOverallAmountTotal;

      // send amount to treasury
      const treasuryContract: contract(unit) = Tezos.get_contract_with_error(s.treasuryAddress, "Error. Treasury Contract not found.");
      const transferAmountToTreasuryOperation : operation = transferTez(treasuryContract, Tezos.amount);
      operations := transferAmountToTreasuryOperation # operations;

      // update token sale ledger
      userTokenSaleRecord.amount      := userTokenSaleRecord.amountBoughtInTez + amountInTez;
      userTokenSaleRecord.lastBought  := Tezos.now;
      s.tokenSaleLedger[Tezos.get_sender()] := userTokenSaleRecord;

} with (operations, s)


(*  claimTokens entrypoint *)
function claimTokens(var s : tokenSaleStorage) : return is
block {
    
      // check if sale has ended
      checkTokenSaleHasEnded(s);

      // init parameters
      const buyer                  : address    = Tezos.get_sender();
      const dailyYield             : nat        = s.config.dailyYield;
      const overallAmountTotal     : nat        = s.overallAmountTotal;
      const tokenPerTez            : nat        = s.tokenPerTez;

      // const vestingInDays          : nat        = s.config.vestingInDays;
      const vestingInMonths        : nat        = s.config.vestingInMonths;
      
      const tokenSaleEndBlockLevel  : nat       = s.tokenSaleEndBlockLevel;
      const tokenSaleEndTimestamp  : timestamp  = s.tokenSaleEndTimestamp;
      const endVestingTimestamp    : timestamp  = s.endVestingTimestamp;
      
      const today                  : timestamp  = Tezos.now;
      const todayBlocks            : nat        = Tezos.get_level();

      // date at which any user can make the first claim
      // const firstClaimPeriod : timestamp = tokenSaleEndTimestamp * (vestingInMonths * oneMonthInSeconds);
      // if today < firstClaim then failwith("Error. You cannot claim your tokens now.") else skip;

      // calculate number of months that has passed since token sale has ended
      const monthsSinceTokenSaleEnd : int = (todayBlocks - tokenSaleEndBlockLevel) / oneMonthBlocks;

      // get user token sale record
      var userTokenSaleRecord : tokenSaleRecordType := case s.tokenSaleLedger[buyer] of [
          Some(_record) -> _record
        | None -> failwith("Error. User token sale record not found.")
      ];

      const lastBought          : timestamp   = userTokenSaleRecord.lastBought;
      var   lastClaimed         : timestamp  := userTokenSaleRecord.lastClaimed;
      const amountBoughtInTez   : nat         = userTokenSaleRecord.amountBoughtInTez;
      var   totalClaimed        : nat        := userTokenSaleRecord.totalClaimed;

      // 


      // // check if this is user's first claim
      // var firstClaimCheck : bool := False;
      // if lastClaimed = lastBought then firstClaimCheck := True else firstClaimCheck := False;

      // check if user is able to claim now
      // var claimValidCheck : bool := False;
      // if firstClaimCheck = True then block {
      //     if today - 
      // }





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
        | ClaimTokens(_parameters)                 -> claimTokens(s)
        
    ]
