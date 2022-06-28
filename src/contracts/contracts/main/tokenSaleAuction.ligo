// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsActionType 
#include "../partials/whitelistContractsTypes.ligo"

// General Contracts: generalContractsType, updateGeneralContractsActionType
#include "../partials/generalContractsTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Token Sale Auction type
#include "../partials/types/tokenSaleAuctionTypes.ligo"

// ------------------------------------------------------------------------------

type tokenSaleAuctionAction is 

      // Admin Entrypoints
      SetAdmin                  of address
    | SetController             of address
    | UpdateWhitelistContracts  of updateWhitelistContractsActionType
    | UpdateGeneralContracts    of updateGeneralContractsActionType

      // Entrypoints
    | AddToWhitelist            of list(address)
    | RemoveFromWhitelist       of list(address)
    | Commit                    of commitActionType
    | CheckPrice                of unit
      
const noOperations : list (operation) = nil;
type return is list (operation) * tokenSaleAuctionStorage

const emptyAddress : address = ("tz1burnburnburnburnburnburnburjAYjjX" : address);

const fixedPointAccuracy: nat = 1_000_000_000_000_000_000_000_000n // 10^24

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

function checkSenderIsAllowed(var s : tokenSaleAuctionStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.controllerAddress) then unit
        else failwith("ONLY_ADMINISTRATOR_OR_CONTROLLER_ALLOWED");



function checkSenderIsAdmin(const s : tokenSaleAuctionStorage): unit is
  if Tezos.sender =/= s.admin then failwith("ONLY_ADMINISTRATOR_ALLOWED")
  else unit



function checkNoAmount(const _p : unit) : unit is
  if Tezos.amount =/= 0tez then failwith("THIS_ENTRYPOINT_SHOULD_NOT_RECEIVE_XTZ")
  else unit



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

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
// On-chain Views Begin
//
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// On-chain Views End
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
function setAdmin(const newAdminAddress : address; var s : tokenSaleAuctionStorage) : return is
block {

  checkSenderIsAdmin(s);
  s.admin := newAdminAddress;

} with (noOperations, s)



(*  setController entrypoint *)
function setController(const newControllerAddress : address; var s : tokenSaleAuctionStorage) : return is
block {
    
  checkSenderIsAllowed(s);
  s.controllerAddress := newControllerAddress;

} with (noOperations, s)



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsActionType; var s: tokenSaleAuctionStorage): return is
block {

    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
  
} with (noOperations, s)



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsActionType; var s : tokenSaleAuctionStorage): return is
block {
  
    checkSenderIsAdmin(s);
    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoints Begin
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



(*  commit entrypoint 
  - user commits tez 
*)
function commit(const amountInTez : nat; var s : tokenSaleStorage) : return is
block {
    
      // check if sale has started
      checkTokenSaleHasStarted(s);

      // check if tez sent is equal to amount specified
      if Tezos.amount =/= naturalToMutez(amountInTez)
      then failwith(error_TEZ_SENT_IS_NOT_EQUAL_TO_AMOUNT_IN_TEZ) 
      else skip;

      // init operations
      var operations : list(operation) := nil;

      // check if user is whitelisted
      if checkInWhitelistAddresses(Tezos.sender, s) then skip else failwith(error_USER_IS_NOT_WHITELISTED);

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
      // const newOverallAmountTotal : nat = s.overallAmountTotal + amountInTez;
      // if newOverallAmountTotal > s.config.overallMaxAmountCap then failwith(error_OVERALL_MAX_AMOUNT_CAP_REACHED) else s.overallAmountTotal := newOverallAmountTotal;

      // send amount to treasury
      const treasuryContract: contract(unit) = Tezos.get_contract_with_error(s.treasuryAddress, "Error. Contract not found at given address");
      const transferAmountToTreasuryOperation : operation = transferTez(treasuryContract, Tezos.amount);
      operations := transferAmountToTreasuryOperation # operations;

      // update token sale ledger
      userTokenSaleRecord.amount      := userTokenSaleRecord.amount + amountInTez;
      userTokenSaleRecord.lastBought  := Tezos.now;
      s.tokenSaleLedger[Tezos.sender] := userTokenSaleRecord;

      // update total committed in xtz
      s.totalCommittedInXtz := s.totalCommittedInXtz + amountInTez;

} with (operations, s)



(*  checkPrice entrypoint *)
function checkPrice(var s : tokenSaleStorage) : return is
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  

  // check if sale has started
  checkTokenSaleHasStarted(s);

  const startBlockLevel     : nat = s.config.startBlockLevel;
  const endBlockLevel       : nat = s.config.endBlockLevel;
  const currentBlockLevel   : nat = Tezos.level; 
  const blocksElapsed       : nat = abs(currentBlockLevel - startBlockLevel);
  
  const startPriceInXtz     : nat = s.config.startPriceInXtz;
  const discountRate        : nat = s.config.discountRate;
  const totalSupply         : nat = s.config.totalSupply;

  // calculate discount rate when duration of token sale is set
  // - difference between start and end price / max blocks elapsed = discount rate per block level

  const totalCommittedInXtz : nat = s.totalCommittedInXtz;

  // calculate current price in xtz
  const discountedPriceInXtz : nat = blocksElapsed * discountRate;
  if discountedPriceInXtz > startPriceInXtz then failwith("error_DISCOUNTED_PRICE_LARGER_THAN_START_PRICE") else skip;
  const currentPriceInXtz : nat = abs(startPriceInXtz - discountedPriceInXtz);

  const committedSupply : nat = ((totalCommittedInXtz * fixedPointAccuracy) / currentPriceInXtz) / fixedPointAccuracy;

  // inverse
  const lowestPriceWithTotalCommittedInXtz  : nat = (totalCommittedInXtz * fixedPointAccuracy) / totalSupply;
  const blocksElapsedWithLowestPrice        : nat = (((startPriceInXtz - lowestPriceWithTotalCommittedInXtz) * fixedPointAccuracy) / discountRate) / fixedPointAccuracy;
  const endBlockLevelWithLowestPrice        : nat = startBlockLevel + blocksElapsedWithLowestPrice; 

  // once end block level is passed, token sale dutch auction ends - commit closed

  // if total committed supply has exceeded total supply then token sale dutch auction has ended
  if committedSupply > totalSupply then s.tokenSaleHasEnded := True else skip;


} with (noOperations, s)

// ------------------------------------------------------------------------------
// Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : tokenSaleAuctionAction; const s : tokenSaleAuctionStorage) : return is 
    case action of [

          // Admin Entrypoints
          SetAdmin (parameters)                   -> setAdmin(paparametersrams, s)
        | SetController (parameters)              -> setController(parameters, s)
        | UpdateWhitelistContracts (parameters)   -> updateWhitelistContracts(parameters, s)
        | UpdateGeneralContracts (parameters)     -> updateGeneralContracts(parameters, s)

          // Entrypoints
        | AddToWhitelist(parameters)              -> addToWhitelist(parameters, s)
        | RemoveFromWhitelist(parameters)         -> removeFromWhitelist(parameters, s)
        | Commit(parameters)                      -> commit(parameters, s)
        | CheckPrice(parameters)                  -> checkPrice(s)
        
        
    ]