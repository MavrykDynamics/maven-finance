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

// Treasury Type for mint and transfers
#include "../partials/types/treasuryTypes.ligo"

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
  | ClaimTokens                 of unit
  
  
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
    if (Tezos.sender = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.sender = Tezos.self_address) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
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
                optionOneBought      = 0n;
                optionTwoBought      = 0n;
                optionThreeBought    = 0n;

                optionOneClaimed     = 0n;
                optionTwoClaimed     = 0n;
                optionThreeClaimed   = 0n;

                optionOneLastClaimed    = Tezos.now;
                optionTwoLastClaimed    = Tezos.now;
                optionThreeLastClaimed  = Tezos.now;

                optionOneLastClaimedBlockLevel    = 0n;
                optionTwoLastClaimedBlockLevel    = 0n;
                optionThreeLastClaimedBlockLevel  = 0n;

                optionOneMonthsClaimed    = 0n;
                optionTwoMonthsClaimed    = 0n;
                optionThreeMonthsClaimed  = 0n;
              ]
          ];

          // check if user
          case tokenOption of [
              | OptionOne(_v) -> block {

                  // check if max amount for option one per whitelist wallet has been exceeded
                  if whitelistUserTokenSaleRecord.optionOneBought + amountBought > s.config.whitelistMaxAmountOptionOneTotal then failwith(error_MAX_AMOUNT_PER_WHITELIST_WALLET_EXCEEDED) else skip;

                  // check if option one whitelist max amount cap has been exceeded
                  const newOptionOneBoughtAmountTotal : nat = s.optionOneBoughtTotal + amountBought;
                  if newOptionOneBoughtAmountTotal > s.config.optionOneMaxAmountCap then failwith(error_WHITELIST_MAX_AMOUNT_CAP_REACHED) else skip;
              }
              | OptionTwo(_v) -> block {

                  // check if max amount for option two per whitelist wallet has been exceeded
                  if whitelistUserTokenSaleRecord.optionTwoBought + amountBought > s.config.whitelistMaxAmountOptionTwoTotal then failwith(error_MAX_AMOUNT_PER_WHITELIST_WALLET_EXCEEDED) else skip;

                  // check if option two whitelist max amount cap has been exceeded
                  const newOptionTwoBoughtAmountTotal : nat = s.optionTwoBoughtTotal + amountBought;
                  if newOptionTwoBoughtAmountTotal > s.config.optionTwoMaxAmountCap then failwith(error_WHITELIST_MAX_AMOUNT_CAP_REACHED) else skip;
              }
              | OptionThree(_v) -> block {
                  
                  // check if max amount for option three per whitelist wallet has been exceeded
                  if whitelistUserTokenSaleRecord.optionThreeBought + amountBought > s.config.whitelistMaxAmountOptionThreeTotal then failwith(error_MAX_AMOUNT_PER_WHITELIST_WALLET_EXCEEDED) else skip;

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
              optionOneBought      = 0n;
              optionTwoBought      = 0n;
              optionThreeBought    = 0n;

              optionOneClaimed     = 0n;
              optionTwoClaimed     = 0n;
              optionThreeClaimed   = 0n;

              optionOneLastClaimed    = Tezos.now;
              optionTwoLastClaimed    = Tezos.now;
              optionThreeLastClaimed  = Tezos.now;

              optionOneLastClaimedBlockLevel    = 0n;
              optionTwoLastClaimedBlockLevel    = 0n;
              optionThreeLastClaimedBlockLevel  = 0n;

              optionOneMonthsClaimed    = 0n;
              optionTwoMonthsClaimed    = 0n;
              optionThreeMonthsClaimed  = 0n;

          ]
      ];

      case tokenOption of [
          | OptionOne(_v) -> block {

              // check if max amount per whitelist wallet has been exceeded
              if userTokenSaleRecord.optionOneBought + amountBought > s.config.maxAmountOptionOnePerWalletTotal then failwith(error_MAX_AMOUNT_PER_WALLET_TOTAL_EXCEEDED) else skip;

              // check if option one whitelist max amount cap has been exceeded
              const newOptionOneBoughtAmountTotal : nat = s.optionOneBoughtTotal + amountBought;
              if newOptionOneBoughtAmountTotal > s.config.optionOneMaxAmountCap then failwith(error_WHITELIST_MAX_AMOUNT_CAP_REACHED) else s.optionOneBoughtTotal := newOptionOneBoughtAmountTotal;

              // update user token sale record
              userTokenSaleRecord.optionOneBought      := userTokenSaleRecord.optionOneBought + amountBought;
          }
          | OptionTwo(_v) -> block {

              // check if max amount per whitelist wallet has been exceeded
              if userTokenSaleRecord.optionTwoBought + amountBought > s.config.whitelistMaxAmountOptionTwoTotal then failwith(error_MAX_AMOUNT_PER_WHITELIST_WALLET_EXCEEDED) else skip;

              // check if option one whitelist max amount cap has been exceeded
              const newOptionTwoBoughtAmountTotal : nat = s.optionTwoBoughtTotal + amountBought;
              if newOptionTwoBoughtAmountTotal > s.config.optionTwoMaxAmountCap then failwith(error_WHITELIST_MAX_AMOUNT_CAP_REACHED) else s.optionTwoBoughtTotal := newOptionTwoBoughtAmountTotal;

              // update user token sale record
              userTokenSaleRecord.optionTwoBought      := userTokenSaleRecord.optionTwoBought + amountBought;
          }
          | OptionThree(_v) -> block {
              
              // check if max amount per whitelist wallet has been exceeded
              if userTokenSaleRecord.optionThreeBought + amountBought > s.config.whitelistMaxAmountOptionThreeTotal then failwith(error_MAX_AMOUNT_PER_WHITELIST_WALLET_EXCEEDED) else skip;

              // check if option one whitelist max amount cap has been exceeded
              const newOptionThreeBoughtAmountTotal : nat = s.optionThreeBoughtTotal + amountBought;
              if newOptionThreeBoughtAmountTotal > s.config.optionThreeMaxAmountCap then failwith(error_WHITELIST_MAX_AMOUNT_CAP_REACHED) else s.optionThreeBoughtTotal := newOptionThreeBoughtAmountTotal;

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
      const buyer                  : address    = Tezos.sender;
      
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

      const optionOneLastClaimed      : timestamp   = userTokenSaleRecord.optionOneLastClaimed;
      const optionTwoLastClaimed      : timestamp   = userTokenSaleRecord.optionTwoLastClaimed;
      const optionThreeLastClaimed    : timestamp   = userTokenSaleRecord.optionThreeLastClaimed;

      const optionOneLastClaimedBlockLevel      : nat   = userTokenSaleRecord.optionOneLastClaimed;
      const optionTwoLastClaimedBlockLevel      : nat   = userTokenSaleRecord.optionTwoLastClaimed;
      const optionThreeLastClaimedBlockLevel    : nat   = userTokenSaleRecord.optionThreeLastClaimed;

      const optionOneMonthsClaimed    : nat         = userTokenSaleRecord.optionOneMonthsClaimed;
      const optionTwoMonthsClaimed    : nat         = userTokenSaleRecord.optionTwoMonthsClaimed;
      const optionThreeMonthsClaimed  : nat         = userTokenSaleRecord.optionThreeMonthsClaimed;

      // calculate number of months that has passed since token sale has ended
      const monthsSinceTokenSaleEnd : int = (todayBlocks - tokenSaleEndBlockLevel) / oneMonthBlocks;

      // date at which any user can claim for the options
      // const optionOneMinClaimPeriod    : timestamp = tokenSaleEndTimestamp * (vestingOptionOneInMonths * oneMonthInSeconds);
      // const optionTwoMinClaimPeriod    : timestamp = tokenSaleEndTimestamp * (vestingOptionTwoInMonths * oneMonthInSeconds);
      // const optionThreeMinClaimPeriod  : timestamp = tokenSaleEndTimestamp * (vestingOptionThreeInMonths * oneMonthInSeconds);

      // const optionOneClaimable : bool = if 

      // check if option two is claimable
      // var optionTwoClaimable := False;
      // if today < optionTwoMinClaimPeriod then skip else optionTwoClaimable := True;

      // // check if option three is claimable
      // var optionThreeClaimable := False;
      // if today < optionThreeMinClaimPeriod then skip else optionThreeClaimable := True;

      // init MVK token type to be used in transfer params
      const mvkTokenType : tokenType = Fa2(record [
          tokenContractAddress  = s.mvkTokenAddress;
          tokenId               = 0n;
      ]); 

      // process claim for option one - skip if fully claimed (months claimed = vesting in months)
      if optionOneMonthsClaimed = vestingOptionOneInMonths then block {

        // check if option one has been bought - skip otherwise
        if optionOneBought = 0n then skip else block {

          // calculate months passed since last claimed for option one
          var monthsToClaim : nat := 0n;
          if optionOneLastClaimedBlockLevel = 0n then block {
            // first claim
            monthsToClaim := abs(Tezos.level - tokenSaleEndBlockLevel) / oneMonthBlocks;
          } else block {
            // has claimed before
            monthsToClaim := abs(Tezos.level - optionOneLastClaimedBlockLevel) / oneMonthBlocks;

            // if total of months to claim + already claimed months is greater then vesting period (in months) then take the remaining months
            // e.g. vesting of 2 months, user claim once on day 0, then claim again for the second time in 6 months - we calculate months to claim as 2 - 1 = 1 month
            if monthsToClaim + optionOneMonthsClaimed > vestingOptionOneInMonths 
            then monthsToClaim := abs(vestingOptionOneInMonths - optionOneMonthsClaimed)
            else monthsToClaim := monthsToClaim;
          }

          // calculate amount to transfer based on amount bought
          const optionOneTokensPerTez  : nat = s.config.optionOneTokensPerTez;

          // account for case where there is no vesting months for option one (least restrictive option)
          var optionOneTokenAmountSingleMonth : nat := 0n;
          if vestingOptionOneInMonths = 0n then block {
            optionOneTokenAmountSingleMonth := ( (optionOneBought * fpa10e24) / optionOneTokensPerTez)  * fpa10e18;
          } else block {
            optionOneTokenAmountSingleMonth := ( ( (optionOneBought * fpa10e24) / optionOneTokensPerTez) / vestingOptionOneInMonths) * fpa10e18;
          }

          // check that user's max tokens claimable is not exceeded
          const maxOptionOneTokenAmount : nat = ( (optionOneBought * fpa10e24) / optionOneTokensPerTez)  * fpa10e18;
          if optionOneClaimedAmount + optionOneTokenAmountSingleMonth > maxOptionOneTokenAmount then failwith("Error. Unable to claim more than the maximum for option one.") else skip;

          // calculate final value of option one token amount to be claimed
          optionOneTokenAmount := optionOneTokenAmountSingleMonth * monthsToClaim;

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

      // process claim for option two - skip if fully claimed (months claimed = vesting in months
      if optionTwoMonthsClaimed = vestingOptionTwoInMonths then block {

        // check if option two has been bought - skip otherwise
        if optionTwoBought = 0n then skip else block {

          // calculate months passed since last claimed for option two
          var monthsToClaim : nat := 0n;
          if optionTwoLastClaimedBlockLevel = 0n then block {
            // first claim 
            monthsToClaim := abs(Tezos.level - tokenSaleEndBlockLevel) / oneMonthBlocks;
          } else block {
            // has claimed before
            monthsToClaim := abs(Tezos.level - optionTwoLastClaimedBlockLevel) / oneMonthBlocks;

            // if total of months to claim + already claimed months is greater then vesting period (in months) then take the remaining months
            // e.g. vesting of 2 months, user claim once on day 0, then claim again for the second time in 6 months - we calculate months to claim as 2 - 1 = 1 month
            if monthsToClaim + optionTwoMonthsClaimed > vestingOptionTwoInMonths 
            then monthsToClaim := abs(vestingOptionTwoInMonths - optionTwoMonthsClaimed)
            else monthsToClaim := monthsToClaim;
          }

          // calculate amount to transfer based on amount bought
          const optionTwoTokensPerTez  : nat = s.config.optionTwoTokensPerTez;

          // account for case where there is no vesting months for option one (least restrictive option)
          // options two and three should not have zero vesting months 
          var optionTwoTokenAmountSingleMonth : nat := ( ( (optionTwoBought * fpa10e24) / optionTwoTokensPerTez) / vestingOptionTwoInMonths) * fpa10e18;
        
          // check that user's max tokens claimable is not exceeded
          const maxOptionTwoTokenAmount : nat = ( (optionTwoBought * fpa10e24) / optionTwoTokensPerTez)  * fpa10e18;
          if optionTwoClaimedAmount + optionTwoTokenAmountSingleMonth > maxOptionTwoTokenAmount then failwith("Error. Unable to claim more than the maximum for option two.") else skip;

          // calculate final value of option two token amount to be claimed
          optionTwoTokenAmount := optionTwoTokenAmountSingleMonth * monthsToClaim;

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


      // process claim for option three - skip if fully claimed (months claimed = vesting in months
      if optionThreeMonthsClaimed = vestingOptionThreeInMonths then block {

        // check if option three has been bought - skip otherwise
        if optionThreeBought = 0n then skip else block {

          // calculate months passed since last claimed for option three
          var monthsToClaim : nat := 0n;
          if optionThreeLastClaimedBlockLevel = 0n then block {
            // first claim 
            monthsToClaim := abs(Tezos.level - tokenSaleEndBlockLevel) / oneMonthBlocks;
          } else block {
            // has claimed before
            monthsToClaim := abs(Tezos.level - optionThreeLastClaimedBlockLevel) / oneMonthBlocks;

            // if total of months to claim + already claimed months is greater then vesting period (in months) then take the remaining months
            // e.g. vesting of 2 months, user claim once on day 0, then claim again for the second time in 6 months - we calculate months to claim as 2 - 1 = 1 month
            if monthsToClaim + optionThreeMonthsClaimed > vestingOptionThreeInMonths 
            then monthsToClaim := abs(vestingOptionThreeInMonths - optionThreeMonthsClaimed)
            else monthsToClaim := monthsToClaim;
          }

          // calculate amount to transfer based on amount bought
          const optionThreeTokensPerTez  : nat = s.config.optionThreeTokensPerTez;

          // account for case where there is no vesting months for option one (least restrictive option)
          // options two and three should not have zero vesting months 
          var optionThreeTokenAmountSingleMonth : nat := ( ( (optionThreeBought * fpa10e24) / optionThreeTokensPerTez) / vestingOptionThreeInMonths) * fpa10e18;

          // check that user's max tokens claimable is not exceeded
          const maxOptionThreeTokenAmount : nat = ( (optionThreeBought * fpa10e24) / optionThreeTokensPerTez)  * fpa10e18;
          if optionThreeClaimedAmount + optionThreeTokenAmountSingleMonth > maxOptionThreeTokenAmount then failwith("Error. Unable to claim more than the maximum for option three.") else skip;

          // calculate final value of option three token amount to be claimed
          optionThreeTokenAmount := optionThreeTokenAmountSingleMonth * monthsToClaim;

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
        | ClaimTokens(_parameters)                 -> claimTokens(s)
        
    ]
