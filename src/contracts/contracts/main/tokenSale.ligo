// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"


// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Treasury Type for mint and transfers
// #include "../partials/types/treasuryTypes.ligo"
// FA2 Transfer Types
#include "../partials/functionalTypes/fa2TransferTypes.ligo"

// TokenSale Types
#include "../partials/types/tokenSaleTypes.ligo"

// ------------------------------------------------------------------------------

type tokenSaleAction is 

    // Default Entrypoint to Receive Tez
  | Default                     of unit
    
    // Housekeeping Entrypoints
  | SetAdmin                    of address
  | UpdateMetadata              of updateMetadataType
  | UpdateConfig                of tokenSaleUpdateConfigParamsType

    // Admin Token Sale Entrypoints
  | SetWhitelistDateTime        of setWhitelistDateTimeActionType
  | AddToWhitelist              of list(address)
  | RemoveFromWhitelist         of list(address)
  | StartSale                   of unit
  | CloseSale                   of unit
  | PauseSale                   of unit
  
    // Token Sale Entrypoints
  | BuyTokens                   of buyTokensType
  | ClaimTokens                 of unit
  
  
const noOperations : list (operation) = nil;
type return is list (operation) * tokenSaleStorage


const oneDayInSeconds : int = 86_400;
const oneMonthInSeconds : int = 2_592_000;

const fpa10e24 : nat = 1_000_000_000_000_000_000_000_000n;       // 10^24
const fpa10e18 : nat = 1_000_000_000_000_000_000n;               // 10^17


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



function checkTokenSaleHasEnded(var s : tokenSaleStorage) : unit is
    if (s.tokenSaleHasEnded = True) then unit
    else failwith(error_TOKEN_SALE_HAS_NOT_ENDED);



function checkTokenSaleHasNotEnded(var s : tokenSaleStorage) : unit is
    if (s.tokenSaleHasEnded = True) then failwith(error_TOKEN_SALE_HAS_ENDED)
    else unit;



function checkTokenSaleIsPaused(var s : tokenSaleStorage) : unit is
    if (s.tokenSalePaused = True) then unit
    else failwith(error_TOKEN_SALE_IS_NOT_PAUSED);



function checkTokenSaleIsNotPaused(var s : tokenSaleStorage) : unit is
    if (s.tokenSalePaused = True) then failwith(error_TOKEN_SALE_IS_PAUSED)
    else unit;



function checkInWhitelistAddresses(const userWalletAddress : address; var s : tokenSaleStorage) : bool is 
block {

    var inWhitelistAddressesMap : bool := False;
    if Big_map.mem(userWalletAddress, s.whitelistedAddresses) then inWhitelistAddressesMap := True else inWhitelistAddressesMap := False;

} with inWhitelistAddressesMap



// function addToWhitelist (const newUserAddress : address; var whitelistedAddresses : whitelistedAddressesType) : whitelistedAddressesType is {
//   whitelistedAddresses [newUserAddress] := True 
// } with whitelistedAddresses



function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Transfer Helper Functions Begin
// ------------------------------------------------------------------------------

function transferTez(const to_ : contract(unit); const amt : tez) : operation is Tezos.transaction(unit, amt, to_)

// helper function to send transfer operation to treasury
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
case (Tezos.get_entrypoint_opt(
      "%transfer",
      contractAddress) : option(contract(transferActionType))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_TRANSFER_ENTRYPOINT_NOT_FOUND) : contract(transferActionType))
      ];



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

(* View: get config *)
[@view] function getConfig(const _: unit; var s : tokenSaleStorage) : tokenSaleConfigType is
  s.config



(* View: get treasury address *)
[@view] function getTreasuryAddress(const _: unit; var s : tokenSaleStorage) : address is
  s.treasuryAddress



(* View: get treasury address *)
[@view] function getWhitelistedAddressOpt(const userAddress: address; var s : tokenSaleStorage) : option(bool) is
  Big_map.find_opt(userAddress, s.whitelistedAddresses)



(* View: get token sale record *)
[@view] function getTokenSaleRecordOpt(const userAddress: address; var s : tokenSaleStorage) : option(tokenSaleRecordType) is
  Big_map.find_opt(userAddress, s.tokenSaleLedger)



(* View: getTokenSaleHasStarted *)
[@view] function getTokenSaleHasStarted(const _: unit; var s : tokenSaleStorage) : bool is
  s.tokenSaleHasStarted



(* View: getWhitelistAmountTotal *)
[@view] function getWhitelistAmountTotal(const _: unit; var s : tokenSaleStorage) : nat is
  s.whitelistAmountTotal



(* View: getOverallAmountTotal *)
[@view] function getOverallAmountTotal(const _: unit; var s : tokenSaleStorage) : nat is
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
function updateConfig(const updateConfigParams : tokenSaleUpdateConfigParamsType; var s : tokenSaleStorage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); // check that sender is admin

  const updateConfigAction    : tokenSaleUpdateConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : tokenSaleUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of [

        MaxAmountOptOnePerWalletTotal (_v)          -> s.config.maxAmountOptionOnePerWalletTotal    := updateConfigNewValue
      | MaxAmountOptTwoPerWalletTotal (_v)          -> s.config.maxAmountOptionTwoPerWalletTotal    := updateConfigNewValue  
      | MaxAmountOptThreePerWalletTotal (_v)        -> s.config.maxAmountOptionThreePerWalletTotal  := updateConfigNewValue
      
      | WhitelistMaxAmountOptOneTotal (_v)          -> s.config.whitelistMaxAmountOptionOneTotal    := updateConfigNewValue  
      | WhitelistMaxAmountOptTwoTotal (_v)          -> s.config.whitelistMaxAmountOptionTwoTotal    := updateConfigNewValue  
      | WhitelistMaxAmountOptThreeTotal (_v)        -> s.config.whitelistMaxAmountOptionThreeTotal  := updateConfigNewValue  

      | OptionOneMaxAmountCap (_v)                  -> s.config.optionOneMaxAmountCap               := updateConfigNewValue  
      | OptionTwoMaxAmountCap (_v)                  -> s.config.optionTwoMaxAmountCap               := updateConfigNewValue  
      | OptionThreeMaxAmountCap (_v)                -> s.config.optionThreeMaxAmountCap             := updateConfigNewValue  

      | VestingOptionOneInMonths (_v)               -> s.config.vestingOptionOneInMonths            := updateConfigNewValue  
      | VestingOptionTwoInMonths (_v)               -> s.config.vestingOptionTwoInMonths            := updateConfigNewValue  
      | VestingOptionThreeInMonths (_v)             -> s.config.vestingOptionThreeInMonths          := updateConfigNewValue  

      | OptionOneTezPerToken (_v)                   -> s.config.optionOneTezPerToken                := updateConfigNewValue  
      | OptionTwoTezPerToken (_v)                   -> s.config.optionTwoTezPerToken                := updateConfigNewValue  
      | OptionThreeTezPerToken (_v)                 -> s.config.optionThreeTezPerToken              := updateConfigNewValue  

      | MinOptionOneAmountInTez (_v)                -> s.config.minOptionOneAmountInTez             := updateConfigNewValue  
      | MinOptionTwoAmountInTez (_v)                -> s.config.minOptionTwoAmountInTez             := updateConfigNewValue  
      | MinOptionThreeAmountInTez (_v)              -> s.config.minOptionThreeAmountInTez           := updateConfigNewValue  

      | BlocksPerMinute (_v)                        -> s.config.blocksPerMinute                     := updateConfigNewValue  

  ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Token Sale Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setWhitelistDateTime entrypoint *)
function setWhitelistDateTime(const setWhitelistDateTimeParams : setWhitelistDateTimeActionType; var s : tokenSaleStorage) : return is
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); // check that sender is admin

  // init params
  const whitelistStartDateTime  : timestamp  = setWhitelistDateTimeParams.whitelistStartDateTime;
  const whitelistEndDateTime    : timestamp  = setWhitelistDateTimeParams.whitelistEndDateTime;

  // update whitelist dates
  s.whitelistStartDateTime  := whitelistStartDateTime;
  s.whitelistEndDateTime    := whitelistEndDateTime;

} with (noOperations, s)


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
function buyTokens(const buyTokensParams : buyTokensType; var s : tokenSaleStorage) : return is
block {
    
      // check if sale has started
      checkTokenSaleHasStarted(s);

      // check that token sale is not paused
      checkTokenSaleIsNotPaused(s);

      // check that token sale has not ended
      checkTokenSaleHasNotEnded(s);

      // init params
      const amountBought  : nat         = buyTokensParams.amount;
      const tokenOption   : optionType  = buyTokensParams.tokenOption;

      // check if tez sent is equal to amount specified
      if Tezos.amount =/= naturalToMutez(amountBought)
      then failwith(error_TEZ_SENT_IS_NOT_EQUAL_TO_AMOUNT_IN_TEZ) 
      else skip;

      // init operations
      var operations : list(operation) := nil;

      // check if whitelist sale has started
      if Tezos.now < s.whitelistStartDateTime
      then failwith(error_WHITELIST_SALE_HAS_NOT_STARTED) 
      else skip;

      // check if whitelist sale has ended -> proceed to public sale
      if Tezos.now > s.whitelistEndDateTime
      then skip 
      else if Tezos.now > s.whitelistStartDateTime then block {
          
          // whitelist sale has started

          // check if user is whitelisted
          if checkInWhitelistAddresses(Tezos.sender, s) then skip else failwith(error_USER_IS_NOT_WHITELISTED);

          // find or create whitelist user token sale record
          var whitelistUserTokenSaleRecord : tokenSaleRecordType := case s.tokenSaleLedger[Tezos.sender] of [
              Some(_record) -> _record
            | None           -> record [
                
                optionOneBought                   = 0n;
                optionTwoBought                   = 0n;
                optionThreeBought                 = 0n;

                optionOneClaimedAmount            = 0n;
                optionTwoClaimedAmount            = 0n;
                optionThreeClaimedAmount          = 0n;

                optionOneMonthsClaimed            = 0n;
                optionTwoMonthsClaimed            = 0n;
                optionThreeMonthsClaimed          = 0n;

                optionOneLastClaimed              = Tezos.now;
                optionTwoLastClaimed              = Tezos.now;
                optionThreeLastClaimed            = Tezos.now;

                optionOneLastClaimedBlockLevel    = 0n;
                optionTwoLastClaimedBlockLevel    = 0n;
                optionThreeLastClaimedBlockLevel  = 0n;

              ]
          ];

          // check if user
          case tokenOption of [
              | OptionOne(_v) -> block {

                  // check if max amount for option one per whitelist wallet has been exceeded
                  if whitelistUserTokenSaleRecord.optionOneBought + amountBought > s.config.whitelistMaxAmountOptionOneTotal then failwith(error_MAX_AMOUNT_OPTION_ONE_WHITELIST_WALLET_EXCEEDED) else skip;

                  // check if option one whitelist max amount cap has been exceeded
                  const newOptionOneBoughtAmountTotal : nat = s.optionOneBoughtTotal + amountBought;
                  if newOptionOneBoughtAmountTotal > s.config.optionOneMaxAmountCap then failwith(error_WHITELIST_MAX_AMOUNT_CAP_REACHED) else skip;
              }
              | OptionTwo(_v) -> block {

                  // check if max amount for option two per whitelist wallet has been exceeded
                  if whitelistUserTokenSaleRecord.optionTwoBought + amountBought > s.config.whitelistMaxAmountOptionTwoTotal then failwith(error_MAX_AMOUNT_OPTION_TWO_WHITELIST_WALLET_EXCEEDED) else skip;

                  // check if option two whitelist max amount cap has been exceeded
                  const newOptionTwoBoughtAmountTotal : nat = s.optionTwoBoughtTotal + amountBought;
                  if newOptionTwoBoughtAmountTotal > s.config.optionTwoMaxAmountCap then failwith(error_WHITELIST_MAX_AMOUNT_CAP_REACHED) else skip;
              }
              | OptionThree(_v) -> block {
                  
                  // check if max amount for option three per whitelist wallet has been exceeded
                  if whitelistUserTokenSaleRecord.optionThreeBought + amountBought > s.config.whitelistMaxAmountOptionThreeTotal then failwith(error_MAX_AMOUNT_OPTION_THREE_WHITELIST_WALLET_EXCEEDED) else skip;

                  // check if option three whitelist max amount cap has been exceeded
                  const newOptionThreeBoughtAmountTotal : nat = s.optionThreeBoughtTotal + amountBought;
                  if newOptionThreeBoughtAmountTotal > s.config.optionThreeMaxAmountCap then failwith(error_WHITELIST_MAX_AMOUNT_CAP_REACHED) else skip;
              }
          ];
  
      } 

      // public sale has started      
      else skip;

      // find or create user token sale record
      var userTokenSaleRecord : tokenSaleRecordType := case s.tokenSaleLedger[Tezos.sender] of [
          Some(_record) -> _record
        | None           -> record [
              
              optionOneBought                   = 0n;
              optionTwoBought                   = 0n;
              optionThreeBought                 = 0n;

              optionOneClaimedAmount            = 0n;
              optionTwoClaimedAmount            = 0n;
              optionThreeClaimedAmount          = 0n;

              optionOneMonthsClaimed            = 0n;
              optionTwoMonthsClaimed            = 0n;
              optionThreeMonthsClaimed          = 0n;

              optionOneLastClaimed              = Tezos.now;
              optionTwoLastClaimed              = Tezos.now;
              optionThreeLastClaimed            = Tezos.now;

              optionOneLastClaimedBlockLevel    = 0n;
              optionTwoLastClaimedBlockLevel    = 0n;
              optionThreeLastClaimedBlockLevel  = 0n;

          ]
      ];

      case tokenOption of [
          | OptionOne(_v) -> block {

              // check if minimum amount has been bought
              if userTokenSaleRecord.optionOneBought + amountBought < s.config.minOptionOneAmountInTez then failwith(error_MIN_AMOUNT_OPTION_ONE_REQUIRED) else skip;

              // check if max amount per wallet has been exceeded
              if userTokenSaleRecord.optionOneBought + amountBought > s.config.maxAmountOptionOnePerWalletTotal then failwith(error_MAX_AMOUNT_OPTION_ONE_PER_WALLET_TOTAL_EXCEEDED) else skip;

              // check if option one whitelist max amount cap has been exceeded
              const newOptionOneBoughtAmountTotal : nat = s.optionOneBoughtTotal + amountBought;
              if newOptionOneBoughtAmountTotal > s.config.optionOneMaxAmountCap then failwith(error_OPTION_ONE_MAX_AMOUNT_CAP_REACHED) else s.optionOneBoughtTotal := newOptionOneBoughtAmountTotal;

              // update user token sale record
              userTokenSaleRecord.optionOneBought      := userTokenSaleRecord.optionOneBought + amountBought;
          }
          | OptionTwo(_v) -> block {

              // check if minimum amount has been bought
              if userTokenSaleRecord.optionTwoBought + amountBought < s.config.minOptionTwoAmountInTez then failwith(error_MIN_AMOUNT_OPTION_TWO_REQUIRED) else skip;

              // check if max amount per wallet has been exceeded
              if userTokenSaleRecord.optionTwoBought + amountBought > s.config.maxAmountOptionTwoPerWalletTotal then failwith(error_MAX_AMOUNT_OPTION_TWO_PER_WALLET_TOTAL_EXCEEDED) else skip;

              // check if option one whitelist max amount cap has been exceeded
              const newOptionTwoBoughtAmountTotal : nat = s.optionTwoBoughtTotal + amountBought;
              if newOptionTwoBoughtAmountTotal > s.config.optionTwoMaxAmountCap then failwith(error_OPTION_TWO_MAX_AMOUNT_CAP_REACHED) else s.optionTwoBoughtTotal := newOptionTwoBoughtAmountTotal;

              // update user token sale record
              userTokenSaleRecord.optionTwoBought      := userTokenSaleRecord.optionTwoBought + amountBought;
          }
          | OptionThree(_v) -> block {
              
              // check if minimum amount has been bought
              if userTokenSaleRecord.optionThreeBought + amountBought < s.config.minOptionThreeAmountInTez then failwith(error_MIN_AMOUNT_OPTION_THREE_REQUIRED) else skip;

              // check if max amount per wallet has been exceeded
              if userTokenSaleRecord.optionThreeBought + amountBought > s.config.maxAmountOptionThreePerWalletTotal then failwith(error_MAX_AMOUNT_OPTION_THREE_PER_WALLET_TOTAL_EXCEEDED) else skip;

              // check if option one whitelist max amount cap has been exceeded
              const newOptionThreeBoughtAmountTotal : nat = s.optionThreeBoughtTotal + amountBought;
              if newOptionThreeBoughtAmountTotal > s.config.optionThreeMaxAmountCap then failwith(error_OPTION_THREE_MAX_AMOUNT_CAP_REACHED) else s.optionThreeBoughtTotal := newOptionThreeBoughtAmountTotal;

              // update user token sale record
              userTokenSaleRecord.optionThreeBought   := userTokenSaleRecord.optionThreeBought + amountBought;
          }
      ];

      // send amount to treasury
      const treasuryContract: contract(unit) = Tezos.get_contract_with_error(s.treasuryAddress, "Error. Contract not found at given address");
      const transferAmountToTreasuryOperation : operation = transferTez(treasuryContract, Tezos.amount);
      operations := transferAmountToTreasuryOperation # operations;

      // update token sale ledger with updated record
      s.tokenSaleLedger[Tezos.sender] := userTokenSaleRecord;

} with (operations, s)



(*  claimTokens entrypoint *)
function claimTokens(var s : tokenSaleStorage) : return is
block {
    
      // check if sale has ended
      checkTokenSaleHasEnded(s);

      // init parameters
      const buyer                       : address           = Tezos.sender;
      
      const vestingOptionOneInMonths    : nat               = s.config.vestingOptionOneInMonths;
      const vestingOptionTwoInMonths    : nat               = s.config.vestingOptionTwoInMonths;
      const vestingOptionThreeInMonths  : nat               = s.config.vestingOptionThreeInMonths;
      
      const today                       : timestamp         = Tezos.now;
      const todayBlocks                 : nat               = Tezos.level;
      const tokenSaleEndTimestamp       : timestamp         = s.tokenSaleEndTimestamp;
      const tokenSaleEndBlockLevel      : nat               = s.tokenSaleEndBlockLevel;
      var operations                    : list(operation)  := nil;

      // check if token sale has ended
      if today < tokenSaleEndTimestamp then failwith("Error. You cannot claim your tokens now.") else skip;

      // get user token sale record
      var userTokenSaleRecord : tokenSaleRecordType := case s.tokenSaleLedger[buyer] of [
          Some(_record) -> _record
        | None -> failwith("Error. User token sale record not found.")
      ];

      // get user token sale record
      const optionOneBought           : nat         = userTokenSaleRecord.optionOneBought;
      const optionTwoBought           : nat         = userTokenSaleRecord.optionTwoBought;
      const optionThreeBought         : nat         = userTokenSaleRecord.optionThreeBought;
      
      const optionOneClaimedAmount    : nat         = userTokenSaleRecord.optionOneClaimedAmount;
      const optionTwoClaimedAmount    : nat         = userTokenSaleRecord.optionTwoClaimedAmount;
      const optionThreeClaimedAmount  : nat         = userTokenSaleRecord.optionThreeClaimedAmount;

      // const optionOneLastClaimed      : timestamp   = userTokenSaleRecord.optionOneLastClaimed;
      // const optionTwoLastClaimed      : timestamp   = userTokenSaleRecord.optionTwoLastClaimed;
      // const optionThreeLastClaimed    : timestamp   = userTokenSaleRecord.optionThreeLastClaimed;

      const optionOneLastClaimedBlockLevel      : nat   = userTokenSaleRecord.optionOneLastClaimedBlockLevel;
      const optionTwoLastClaimedBlockLevel      : nat   = userTokenSaleRecord.optionTwoLastClaimedBlockLevel;
      const optionThreeLastClaimedBlockLevel    : nat   = userTokenSaleRecord.optionThreeLastClaimedBlockLevel;

      const optionOneMonthsClaimed    : nat         = userTokenSaleRecord.optionOneMonthsClaimed;
      const optionTwoMonthsClaimed    : nat         = userTokenSaleRecord.optionTwoMonthsClaimed;
      const optionThreeMonthsClaimed  : nat         = userTokenSaleRecord.optionThreeMonthsClaimed;

      // calculate number of months that has passed since token sale has ended
      const oneMonthBlocks            : nat = (s.config.blocksPerMinute * 60n * 24n) * 30n;
      const monthsSinceTokenSaleEnd   : nat = abs(todayBlocks - tokenSaleEndBlockLevel) / oneMonthBlocks;

      // init MVK token type to be used in transfer params
      const mvkTokenType : tokenType = Fa2(record [
          tokenContractAddress  = s.mvkTokenAddress;
          tokenId               = 0n;
      ]); 
      
      // check if option one has been bought - skip otherwise
      if optionOneBought = 0n then block {

        // process claim for option one - skip if fully claimed (months claimed = vesting in months)  
        if optionOneMonthsClaimed = vestingOptionOneInMonths then skip else block {

          // calculate months passed since last claimed for option one
          var monthsToClaim : nat := 0n;
          if optionOneLastClaimedBlockLevel = 0n then block {
            // first claim
            monthsToClaim := monthsSinceTokenSaleEnd;
          } else block {
            // has claimed before
            monthsToClaim := abs(Tezos.level - optionOneLastClaimedBlockLevel) / oneMonthBlocks;

            // if total of months to claim + already claimed months is greater then vesting period (in months) then take the remaining months
            // e.g. vesting of 2 months, user claim once on day 0, then claim again for the second time in 6 months - we calculate months to claim as 2 - 1 = 1 month
            if monthsToClaim + optionOneMonthsClaimed > vestingOptionOneInMonths 
            then monthsToClaim := abs(vestingOptionOneInMonths - optionOneMonthsClaimed)
            else monthsToClaim := monthsToClaim;
          };

          // calculate amount to transfer based on amount bought
          const optionOneTezPerToken  : nat = s.config.optionOneTezPerToken;

          // account for case where there is no vesting months for option one (least restrictive option)
          var optionOneTokenAmountSingleMonth : nat := 0n;
          if vestingOptionOneInMonths = 0n then block {
            optionOneTokenAmountSingleMonth := ( (optionOneBought * fpa10e24) / optionOneTezPerToken)  * fpa10e18;
          } else block {
            optionOneTokenAmountSingleMonth := ( ( (optionOneBought * fpa10e24) / optionOneTezPerToken) / vestingOptionOneInMonths) * fpa10e18;
          };

          // check that user's max tokens claimable is not exceeded
          const maxOptionOneTokenAmount : nat = ( (optionOneBought * fpa10e24) / optionOneTezPerToken)  * fpa10e18;
          if optionOneClaimedAmount + optionOneTokenAmountSingleMonth > maxOptionOneTokenAmount then failwith("Error. Unable to claim more than the maximum for option one.") else skip;

          // calculate final value of option one token amount to be claimed
          const optionOneTokenAmount : nat = optionOneTokenAmountSingleMonth * monthsToClaim;

          // create transfer params and transfer operation
          const optionOneTransferTokenParams : transferActionType = list[
            record [
                to_        = buyer;
                token      = mvkTokenType;
                amount     = optionOneTokenAmount; 
            ]
          ];

          const sendOptionOneMvkTokensToBuyerOperation : operation = Tezos.transaction(
            optionOneTransferTokenParams,
            0mutez,
            sendTransferOperationToTreasury(s.treasuryAddress)
          );

          operations := sendOptionOneMvkTokensToBuyerOperation # operations;

          // update user token sale record
          userTokenSaleRecord.optionOneMonthsClaimed          := userTokenSaleRecord.optionOneMonthsClaimed + monthsToClaim;
          userTokenSaleRecord.optionOneClaimedAmount          := userTokenSaleRecord.optionOneClaimedAmount + optionOneTokenAmount;
          userTokenSaleRecord.optionOneLastClaimed            := Tezos.now;
          userTokenSaleRecord.optionOneLastClaimedBlockLevel  := Tezos.level;

        };

      } else skip;



      // check if option two has been bought - skip otherwise
      if optionTwoBought = 0n then block {

        // process claim for option two - skip if fully claimed (months claimed = vesting in months        
        if  optionTwoMonthsClaimed = vestingOptionTwoInMonths then skip else block {

          // calculate months passed since last claimed for option two
          var monthsToClaim : nat := 0n;
          if optionTwoLastClaimedBlockLevel = 0n then block {
            // first claim 
            monthsToClaim := monthsSinceTokenSaleEnd;
          } else block {
            // has claimed before
            monthsToClaim := abs(Tezos.level - optionTwoLastClaimedBlockLevel) / oneMonthBlocks;

            // if total of months to claim + already claimed months is greater then vesting period (in months) then take the remaining months
            // e.g. vesting of 2 months, user claim once on day 0, then claim again for the second time in 6 months - we calculate months to claim as 2 - 1 = 1 month
            if monthsToClaim + optionTwoMonthsClaimed > vestingOptionTwoInMonths 
            then monthsToClaim := abs(vestingOptionTwoInMonths - optionTwoMonthsClaimed)
            else monthsToClaim := monthsToClaim;
          };

          // calculate amount to transfer based on amount bought
          const optionTwoTezPerToken  : nat = s.config.optionTwoTezPerToken;

          // account for case where there is no vesting months for option one (least restrictive option)
          // options two and three should not have zero vesting months 
          var optionTwoTokenAmountSingleMonth : nat := ( ( (optionTwoBought * fpa10e24) / optionTwoTezPerToken) / vestingOptionTwoInMonths) * fpa10e18;
        
          // check that user's max tokens claimable is not exceeded
          const maxOptionTwoTokenAmount : nat = ( (optionTwoBought * fpa10e24) / optionTwoTezPerToken)  * fpa10e18;
          if optionTwoClaimedAmount + optionTwoTokenAmountSingleMonth > maxOptionTwoTokenAmount then failwith("Error. Unable to claim more than the maximum for option two.") else skip;

          // calculate final value of option two token amount to be claimed
          const optionTwoTokenAmount : nat = optionTwoTokenAmountSingleMonth * monthsToClaim;

          // create transfer params and transfer operation
          const optionTwoTransferTokenParams : transferActionType = list[
            record [
                to_        = buyer;
                token      = mvkTokenType;
                amount     = optionTwoTokenAmount; 
            ]
          ];

          const sendOptionTwoMvkTokensToBuyerOperation : operation = Tezos.transaction(
            optionTwoTransferTokenParams,
            0mutez,
            sendTransferOperationToTreasury(s.treasuryAddress)
          );

          operations := sendOptionTwoMvkTokensToBuyerOperation # operations;

          // update user token sale record
          userTokenSaleRecord.optionTwoMonthsClaimed          := userTokenSaleRecord.optionTwoMonthsClaimed + monthsToClaim;
          userTokenSaleRecord.optionTwoClaimedAmount          := userTokenSaleRecord.optionTwoClaimedAmount + optionTwoTokenAmount;
          userTokenSaleRecord.optionTwoLastClaimed            := Tezos.now;
          userTokenSaleRecord.optionTwoLastClaimedBlockLevel  := Tezos.level;

        };

      } else skip;


      
      // check if option three has been bought - skip otherwise
      if optionThreeBought = 0n then block {

        // process claim for option three - skip if fully claimed (months claimed = vesting in months  
        if optionThreeMonthsClaimed = vestingOptionThreeInMonths then skip else block {

          // calculate months passed since last claimed for option three
          var monthsToClaim : nat := 0n;
          if optionThreeLastClaimedBlockLevel = 0n then block {
            // first claim 
            monthsToClaim := monthsSinceTokenSaleEnd;
          } else block {
            // has claimed before
            monthsToClaim := abs(Tezos.level - optionThreeLastClaimedBlockLevel) / oneMonthBlocks;

            // if total of months to claim + already claimed months is greater then vesting period (in months) then take the remaining months
            // e.g. vesting of 2 months, user claim once on day 0, then claim again for the second time in 6 months - we calculate months to claim as 2 - 1 = 1 month
            if monthsToClaim + optionThreeMonthsClaimed > vestingOptionThreeInMonths 
            then monthsToClaim := abs(vestingOptionThreeInMonths - optionThreeMonthsClaimed)
            else monthsToClaim := monthsToClaim;
          };

          // calculate amount to transfer based on amount bought
          const optionThreeTezPerToken  : nat = s.config.optionThreeTezPerToken;

          // account for case where there is no vesting months for option one (least restrictive option)
          // options two and three should not have zero vesting months 
          var optionThreeTokenAmountSingleMonth : nat := ( ( (optionThreeBought * fpa10e24) / optionThreeTezPerToken) / vestingOptionThreeInMonths) * fpa10e18;

          // check that user's max tokens claimable is not exceeded
          const maxOptionThreeTokenAmount : nat = ( (optionThreeBought * fpa10e24) / optionThreeTezPerToken)  * fpa10e18;
          if optionThreeClaimedAmount + optionThreeTokenAmountSingleMonth > maxOptionThreeTokenAmount then failwith("Error. Unable to claim more than the maximum for option three.") else skip;

          // calculate final value of option three token amount to be claimed
          const optionThreeTokenAmount : nat = optionThreeTokenAmountSingleMonth * monthsToClaim;

          // create transfer params and transfer operation
          const optionThreeTransferTokenParams : transferActionType = list[
            record [
                to_        = buyer;
                token      = mvkTokenType;
                amount     = optionThreeTokenAmount; 
            ]
          ];

          const sendOptionThreeMvkTokensToBuyerOperation : operation = Tezos.transaction(
            optionThreeTransferTokenParams,
            0mutez,
            sendTransferOperationToTreasury(s.treasuryAddress)
          );

          operations := sendOptionThreeMvkTokensToBuyerOperation # operations;

          // update user token sale record
          userTokenSaleRecord.optionThreeMonthsClaimed          := userTokenSaleRecord.optionThreeMonthsClaimed + monthsToClaim;
          userTokenSaleRecord.optionThreeClaimedAmount          := userTokenSaleRecord.optionThreeClaimedAmount + optionThreeTokenAmount;
          userTokenSaleRecord.optionThreeLastClaimed            := Tezos.now;
          userTokenSaleRecord.optionThreeLastClaimedBlockLevel  := Tezos.level;

        };

      } else skip;

      // update token sale ledger
      s.tokenSaleLedger[buyer] := userTokenSaleRecord;

} with (operations, s)




(*  startSale entrypoint *)
function startSale(var s : tokenSaleStorage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    
    s.tokenSaleHasStarted     := True;
    s.tokenSaleHasEnded       := False;
    
} with (noOperations, s)



(*  closeSale entrypoint *)
function closeSale(var s : tokenSaleStorage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    
    s.tokenSaleHasEnded       := True;
    s.tokenSaleEndTimestamp   := Tezos.now;
    s.tokenSaleEndBlockLevel  := Tezos.level;

} with (noOperations, s)



(*  pauseSale entrypoint *)
function pauseSale(var s : tokenSaleStorage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    
    // if sale is paused, then unpause sale, and vice versa
    if s.tokenSalePaused = True then s.tokenSalePaused := False else s.tokenSalePaused := True;
    
} with (noOperations, s)


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

          // Admin Token Sale Entrypoints
        | SetWhitelistDateTime(parameters)        -> setWhitelistDateTime(parameters, s)
        | AddToWhitelist(parameters)              -> addToWhitelist(parameters, s)
        | RemoveFromWhitelist(parameters)         -> removeFromWhitelist(parameters, s)
        | StartSale(_parameters)                  -> startSale(s)
        | CloseSale(_parameters)                  -> closeSale(s)
        | PauseSale(_parameters)                  -> pauseSale(s)

          // Token Sale Entrypoints
        | BuyTokens(parameters)                   -> buyTokens(parameters, s)
        | ClaimTokens(_parameters)                -> claimTokens(s)
        
    ]
