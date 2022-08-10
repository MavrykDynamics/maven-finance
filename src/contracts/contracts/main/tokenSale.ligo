// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Helpers and Types
// ------------------------------------------------------------------------------

// Shared Helpers
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Helpers
#include "../partials/shared/transferHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// TokenSale Types
#include "../partials/contractTypes/tokenSaleTypes.ligo"

// ------------------------------------------------------------------------------

type tokenSaleAction is 

    // Default Entrypoint to Receive Tez
    |   Default                     of unit
    
    // Housekeeping Entrypoints
    |   SetAdmin                    of address
    |   UpdateMetadata              of updateMetadataType
    |   UpdateConfig                of tokenSaleUpdateConfigParamsType

    // Admin Token Sale Entrypoints
    |   SetWhitelistTimestamp       of setWhitelistTimestampActionType
    |   AddToWhitelist              of list(address)
    |   RemoveFromWhitelist         of list(address)
    |   StartSale                   of unit
    |   CloseSale                   of unit
    |   PauseSale                   of unit
  
    // Token Sale Entrypoints
    |   BuyTokens                   of buyTokensType
    |   ClaimTokens                 of address
  
  
const noOperations : list (operation) = nil;
type return is list (operation) * tokenSaleStorageType


const oneDayInSeconds : int = 86_400;
const oneMonthInSeconds : int = 2_592_000;

const fpa10e24 : nat = 1_000_000_000_000_000_000_000_000n;       // 10^24
const fpa10e18 : nat = 1_000_000_000_000_000_000n;               // 10^18
const fpa10e15 : nat = 1_000_000_000_000_000n;                   // 10^15

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



function checkTokenSaleHasEnded(var s : tokenSaleStorageType) : unit is
    if (s.tokenSaleHasEnded = True) then unit
    else failwith(error_TOKEN_SALE_HAS_NOT_ENDED);



function checkTokenSaleHasNotEnded(var s : tokenSaleStorageType) : unit is
    if (s.tokenSaleHasEnded = True) then failwith(error_TOKEN_SALE_HAS_ENDED)
    else unit;



function checkTokenSaleIsPaused(var s : tokenSaleStorageType) : unit is
    if (s.tokenSalePaused = True) then unit
    else failwith(error_TOKEN_SALE_IS_NOT_PAUSED);



function checkTokenSaleIsNotPaused(var s : tokenSaleStorageType) : unit is
    if (s.tokenSalePaused = True) then failwith(error_TOKEN_SALE_IS_PAUSED)
    else unit;



function checkInWhitelistAddresses(const userWalletAddress : address; var s : tokenSaleStorageType) : bool is 
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
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get transfer entrypoint in treasury contract
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        contractAddress) : option(contract(transferActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
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
[@view] function getAdmin(const _ : unit; var s : tokenSaleStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _: unit; var s : tokenSaleStorageType) : tokenSaleConfigType is
    s.config



(* View: get treasury address *)
[@view] function getTreasuryAddress(const _: unit; var s : tokenSaleStorageType) : address is
    s.treasuryAddress



(* View: check whitelist by address *)
[@view] function checkWhitelistByAddressOpt(const userAddress: address; var s : tokenSaleStorageType) : option(bool) is
    Big_map.find_opt(userAddress, s.whitelistedAddresses)



(* View: get token sale record *)
[@view] function getTokenSaleRecordOpt(const userAddress: address; var s : tokenSaleStorageType) : option(tokenSaleRecordType) is
    Big_map.find_opt(userAddress, s.tokenSaleLedger)



(* View: getWhitelistStartTimestamp *)
[@view] function getWhitelistStartTimestamp(const _: unit; var s : tokenSaleStorageType) : timestamp is
    s.whitelistStartTimestamp



(* View: getWhitelistEndTimestamp *)
[@view] function getWhitelistEndTimestamp(const _: unit; var s : tokenSaleStorageType) : timestamp is
    s.whitelistEndTimestamp



(* View: getTokenSaleHasStarted *)
[@view] function getTokenSaleHasStarted(const _: unit; var s : tokenSaleStorageType) : bool is
    s.tokenSaleHasStarted



(* View: getTokenSaleHasEnded *)
[@view] function getTokenSaleHasEnded(const _: unit; var s : tokenSaleStorageType) : bool is
    s.tokenSaleHasEnded



(* View: getTokenSalePaused *)
[@view] function getTokenSalePaused(const _: unit; var s : tokenSaleStorageType) : bool is
    s.tokenSalePaused



(* View: getTokenSaleEndTimestamp *)
[@view] function getTokenSaleEndTimestamp(const _: unit; var s : tokenSaleStorageType) : timestamp is
    s.tokenSaleEndTimestamp



(* View: getTokenSaleEndBlockLevel *)
[@view] function getTokenSaleEndBlockLevel(const _: unit; var s : tokenSaleStorageType) : nat is
    s.tokenSaleEndBlockLevel

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
function updateConfig(const updateConfigParams : tokenSaleUpdateConfigParamsType; var s : tokenSaleStorageType) : return is 
block {

    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    // check that sender is admin
    checkSenderIsAdmin(s);

    const updateConfigAction    : tokenSaleUpdateConfigActionType   = updateConfigParams.updateConfigAction;
    const updateConfigNewValue  : tokenSaleUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

    case updateConfigAction of [
            MaxAmountPerWalletTotal (_buyOptionIndex)      -> case s.config.buyOptions[_buyOptionIndex] of [
                        Some (_buyOption)   -> block{
                                var buyOptionConfig : tokenSaleOptionType   := _buyOption;
                                buyOptionConfig.maxAmountPerWalletTotal     := updateConfigNewValue;
                                s.config.buyOptions[_buyOptionIndex]        := buyOptionConfig;
                            }
                    |   None                -> failwith(error_BUY_OPTION_NOT_FOUND)
                ]
        |   WhitelistMaxAmountTotal (_buyOptionIndex)      -> case s.config.buyOptions[_buyOptionIndex] of [
                        Some (_buyOption)   -> block{
                                var buyOptionConfig : tokenSaleOptionType   := _buyOption;
                                buyOptionConfig.whitelistMaxAmountTotal     := updateConfigNewValue;
                                s.config.buyOptions[_buyOptionIndex]        := buyOptionConfig;
                            }
                    |   None                -> failwith(error_BUY_OPTION_NOT_FOUND)
                ]
        |   MaxAmountCap            (_buyOptionIndex)      -> case s.config.buyOptions[_buyOptionIndex] of [
                        Some (_buyOption)   -> block{
                                var buyOptionConfig : tokenSaleOptionType   := _buyOption;
                                buyOptionConfig.maxAmountCap                := updateConfigNewValue;
                                s.config.buyOptions[_buyOptionIndex]        := buyOptionConfig;
                            }
                    |   None                -> failwith(error_BUY_OPTION_NOT_FOUND)
                ]
        |   VestingInMonths         (_buyOptionIndex)      -> case s.config.buyOptions[_buyOptionIndex] of [
                        Some (_buyOption)   -> block{
                                var buyOptionConfig : tokenSaleOptionType   := _buyOption;
                                buyOptionConfig.vestingInMonths             := updateConfigNewValue;
                                s.config.buyOptions[_buyOptionIndex]        := buyOptionConfig;
                            }
                    |   None                -> failwith(error_BUY_OPTION_NOT_FOUND)
                ]
        |   TezPerToken             (_buyOptionIndex)      -> case s.config.buyOptions[_buyOptionIndex] of [
                        Some (_buyOption)   -> block{
                                var buyOptionConfig : tokenSaleOptionType   := _buyOption;
                                buyOptionConfig.tezPerToken                 := (updateConfigNewValue * 1mutez);
                                s.config.buyOptions[_buyOptionIndex]        := buyOptionConfig;
                            }
                    |   None                -> failwith(error_BUY_OPTION_NOT_FOUND)
                ]
        |   MinTezAmount            (_buyOptionIndex)      -> case s.config.buyOptions[_buyOptionIndex] of [
                        Some (_buyOption)   -> block{
                                var buyOptionConfig : tokenSaleOptionType   := _buyOption;
                                buyOptionConfig.minTezAmount                := (updateConfigNewValue * 1mutez);
                                s.config.buyOptions[_buyOptionIndex]        := buyOptionConfig;
                            }
                    |   None                -> failwith(error_BUY_OPTION_NOT_FOUND)
                ]
    ]
} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Token Sale Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setWhitelistTimestamp entrypoint *)
function setWhitelistTimestamp(const setWhitelistTimestampParams : setWhitelistTimestampActionType; var s : tokenSaleStorageType) : return is
block {

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin

    // init params
    const whitelistStartTimestamp  : timestamp  = setWhitelistTimestampParams.whitelistStartTimestamp;
    const whitelistEndTimestamp    : timestamp  = setWhitelistTimestampParams.whitelistEndTimestamp;

    // update whitelist dates
    s.whitelistStartTimestamp  := whitelistStartTimestamp;
    s.whitelistEndTimestamp    := whitelistEndTimestamp;

} with (noOperations, s)


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
function buyTokens(const buyTokensParams : buyTokensType; var s : tokenSaleStorageType) : return is
block {
    
    // check if sale has started
    checkTokenSaleHasStarted(s);

    // check that token sale is not paused
    checkTokenSaleIsNotPaused(s);

    // check that token sale has not ended
    checkTokenSaleHasNotEnded(s);

    // init params
    const amountBought  : nat       = buyTokensParams.amount;
    const buyOption     : nat       = buyTokensParams.buyOption;

    // empty record for future use
    const emptyBuyOptionRecord : tokenSaleUserOptionType        = record [
        tokenBought         = 0n;
        tokenClaimed        = 0n;
        claimCounter       = 0n;
        lastClaimTimestamp  = Tezos.get_now();
        lastClaimLevel      = 0n;
    ];

    // get buy option configuration
    var buyOptionConfig : tokenSaleOptionType   := case Map.find_opt(buyOption, s.config.buyOptions) of [
            Some (_option)  -> _option
        |   None            -> failwith(error_BUY_OPTION_NOT_FOUND)
    ];

    // find or create user token sale record
    var userTokenSaleOptionRecord : tokenSaleUserOptionType := case s.tokenSaleLedger[Tezos.get_sender()] of [
            Some(_record)   -> case _record[buyOption] of [
                    Some (_buyOption)   -> _buyOption
                |   None                -> emptyBuyOptionRecord
            ]
        |   None            -> emptyBuyOptionRecord
    ];

    // check if tez sent is equal to amount specified
    if Tezos.get_amount() =/= naturalToMutez(amountBought)
    then failwith(error_TEZ_SENT_IS_NOT_EQUAL_TO_AMOUNT_IN_TEZ) 
    else skip;

    // init operations
    var operations : list(operation) := nil;

    // check if whitelist sale has started
    if Tezos.get_now() < s.whitelistStartTimestamp
    then failwith(error_WHITELIST_SALE_HAS_NOT_STARTED) 
    else skip;
    
    // check if whitelist sale has ended -> proceed to public sale
    if Tezos.get_now() > s.whitelistEndTimestamp
    then skip 
    else if Tezos.get_now() > s.whitelistStartTimestamp then block {
          
        // whitelist sale has started
        // check if user is whitelisted
        if checkInWhitelistAddresses(Tezos.get_sender(), s) then skip else failwith(error_USER_IS_NOT_WHITELISTED);

        // check if max amount per whitelist wallet has been exceeded for current option
        if userTokenSaleOptionRecord.tokenBought + amountBought > buyOptionConfig.whitelistMaxAmountTotal then failwith(error_MAX_AMOUNT_WHITELIST_WALLET_EXCEEDED) else skip;

        // check if current option whitelist max amount cap has been exceeded
        const newBoughtAmountTotal : nat = buyOptionConfig.totalBought + amountBought;
        if newBoughtAmountTotal > buyOptionConfig.maxAmountCap then failwith(error_WHITELIST_MAX_AMOUNT_CAP_REACHED) else skip;
    }
    // public sale has started      
    else skip;

    // check if minimum amount has been bought
    if 1mutez * (userTokenSaleOptionRecord.tokenBought + amountBought) < buyOptionConfig.minTezAmount then failwith(error_MIN_TEZ_AMOUNT_NOT_REACHED) else skip;

    // check if max amount per wallet has been exceeded
    if userTokenSaleOptionRecord.tokenBought + amountBought > buyOptionConfig.maxAmountPerWalletTotal then failwith(error_MAX_AMOUNT_PER_WALLET_TOTAL_EXCEEDED) else skip;

    // check if current option whitelist max amount cap has been exceeded
    const newBoughtAmountTotal : nat = buyOptionConfig.totalBought + amountBought;
    if newBoughtAmountTotal > buyOptionConfig.maxAmountCap then failwith(error_MAX_AMOUNT_CAP_EXCEEDED) else buyOptionConfig.totalBought := newBoughtAmountTotal;

    // update user token sale record
    userTokenSaleOptionRecord.tokenBought         := userTokenSaleOptionRecord.tokenBought + amountBought;

    // send amount to treasury
    const treasuryContract: contract(unit)              = Tezos.get_contract_with_error(s.treasuryAddress, "Error. Contract not found at given address");
    const transferAmountToTreasuryOperation : operation = transferTez(treasuryContract, Tezos.get_amount());
    operations                                          := transferAmountToTreasuryOperation # operations;

    // update token sale ledger with updated record
    s.tokenSaleLedger[Tezos.get_sender()]   := case s.tokenSaleLedger[Tezos.get_sender()] of [
            Some (_userRecord)  -> Map.update(buyOption, Some (userTokenSaleOptionRecord), _userRecord)
        |   None                -> map [
                buyOption   ->     userTokenSaleOptionRecord
            ]
    ];
    s.config.buyOptions[buyOption]          := buyOptionConfig;

} with (operations, s)



(*  claimTokens entrypoint *)
function claimTokens(const user : address; var s : tokenSaleStorageType) : return is
block {
    
    // check if sale has ended
    checkTokenSaleHasEnded(s);

    // init parameters
    const today                       : timestamp                       = Tezos.get_now();
    const todayBlocks                 : nat                             = Tezos.get_level();
    const tokenSaleEndTimestamp       : timestamp                       = s.tokenSaleEndTimestamp;
    const tokenSaleEndBlockLevel      : nat                             = s.tokenSaleEndBlockLevel;
    var operations                    : list(operation)                 := nil;
    
    // check if token sale has ended
    if today < tokenSaleEndTimestamp then failwith(error_TOKEN_SALE_HAS_NOT_ENDED) else skip;
    
    // get user token sale record
    var userTokenSaleRecord : tokenSaleRecordType := case s.tokenSaleLedger[user] of [
            Some(_record)   -> _record
        |   None            -> failwith(error_USER_TOKEN_SALE_RECORD_NOT_FOUND)
    ];

    // calculate number of months that has passed since token sale has ended
    const oneMonthBlocks : nat      = (60n * 60n * 24n * 30n) / Tezos.get_min_block_time(); // 86400

    // init MVK token type to be used in transfer params
    const mvkTokenType : tokenType  = Fa2(record [
        tokenContractAddress  = s.mvkTokenAddress;
        tokenId               = 0n;
    ]);

    // register claim
    s.tokenSaleLedger[user] := case s.tokenSaleLedger[user] of [
            Some (_userRecord)  -> block {
                // init updated claim record
                var userBuyOptions : map(nat, tokenSaleUserOptionType)  := _userRecord;

                // claim loop
                for buyOptionIndex -> userBuyOption in map userBuyOptions {

                    // get buy option config
                    const _buyOptionConfig : tokenSaleOptionType        = case Map.find_opt(buyOptionIndex, s.config.buyOptions) of [
                            Some (_option)  -> _option
                        |   None            -> failwith(error_BUY_OPTION_NOT_FOUND)
                    ];

                    // process claim - skip if fully claimed (months claimed = vesting in months)  
                    if userBuyOption.claimCounter = _buyOptionConfig.vestingInMonths then skip else block {

                        // calculate months passed since last claimed for option one
                        var monthsToClaim : nat := 0n;
                        if userBuyOption.lastClaimLevel = 0n then block {
                            
                            // first claim
                            monthsToClaim := if abs(todayBlocks - tokenSaleEndBlockLevel) / oneMonthBlocks < 1n then 1n else (abs(todayBlocks - tokenSaleEndBlockLevel) / oneMonthBlocks) + 1n;
                            monthsToClaim := if monthsToClaim > _buyOptionConfig.vestingInMonths then _buyOptionConfig.vestingInMonths else monthsToClaim;

                        } else block {
                            // has claimed before
                            monthsToClaim := abs(todayBlocks - userBuyOption.lastClaimLevel) / oneMonthBlocks;

                            // if total of months to claim + already claimed months is greater then vesting period (in months) then take the remaining months
                            // e.g. vesting of 2 months, user claim once on day 0, then claim again for the second time in 6 months - we calculate months to claim as 2 - 1 = 1 month
                            if monthsToClaim + userBuyOption.claimCounter > _buyOptionConfig.vestingInMonths then monthsToClaim := abs(_buyOptionConfig.vestingInMonths - userBuyOption.claimCounter)
                            else monthsToClaim := monthsToClaim;
                        };

                        // calculate amount to transfer based on amount bought
                        const tezPerToken  : nat    = (_buyOptionConfig.tezPerToken / 1mutez);

                        // account for case where there is no vesting months for option one (least restrictive option)
                        var tokenAmountSingleMonth : nat    := if _buyOptionConfig.vestingInMonths = 0n then 
                            ( (userBuyOption.tokenBought * fpa10e24) / tezPerToken)  / fpa10e15
                        else 
                            ( ( (userBuyOption.tokenBought * fpa10e24) / tezPerToken) / _buyOptionConfig.vestingInMonths) / fpa10e15;

                        // check that user's max tokens claimable is not exceeded
                        const maxTokenAmount : nat  = ( (userBuyOption.tokenBought * fpa10e24) / tezPerToken)  / fpa10e15;
                        if userBuyOption.tokenClaimed + tokenAmountSingleMonth > maxTokenAmount then failwith(error_MAX_AMOUNT_CLAIMED) else skip;

                        // calculate final value token amount to be claimed
                        const tokenAmount : nat = tokenAmountSingleMonth * monthsToClaim;

                        // create transfer params and transfer operation
                        const transferTokenParams : transferActionType = list[
                            record [
                                to_        = user;
                                token      = mvkTokenType;
                                amount     = tokenAmount; 
                            ]
                        ];

                        const sendMvkTokensToBuyerOperation : operation = Tezos.transaction(
                            transferTokenParams,
                            0mutez,
                            sendTransferOperationToTreasury(s.treasuryAddress)
                        );

                        operations := sendMvkTokensToBuyerOperation # operations;

                        // update user token sale record
                        userBuyOption.claimCounter             := userBuyOption.claimCounter + monthsToClaim;
                        userBuyOption.tokenClaimed              := userBuyOption.tokenClaimed + tokenAmount;
                        userBuyOption.lastClaimTimestamp        := Tezos.get_now();
                        userBuyOption.lastClaimLevel            := Tezos.get_level();
                        userBuyOptions[buyOptionIndex]          := userBuyOption;
                    }
                }
            } with(userBuyOptions)
        |   None                -> failwith(error_USER_TOKEN_SALE_RECORD_NOT_FOUND)
    ];

} with (operations, s)




(*  startSale entrypoint *)
function startSale(var s : tokenSaleStorageType) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    
    s.tokenSaleHasStarted     := True;
    s.tokenSaleHasEnded       := False;
    
} with (noOperations, s)



(*  closeSale entrypoint *)
function closeSale(var s : tokenSaleStorageType) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    
    s.tokenSaleHasEnded       := True;
    s.tokenSaleEndTimestamp   := Tezos.get_now();
    s.tokenSaleEndBlockLevel  := Tezos.get_level();

} with (noOperations, s)



(*  pauseSale entrypoint *)
function pauseSale(var s : tokenSaleStorageType) : return is
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
function main (const action : tokenSaleAction; const s : tokenSaleStorageType) : return is 

    case action of [

            // Default Entrypoint to Receive Tez
        |   Default(_params)                        -> ((nil : list(operation)), s)

            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                    -> setAdmin(parameters, s)
        |   UpdateMetadata(parameters)              -> updateMetadata(parameters, s)  
        |   UpdateConfig(parameters)                -> updateConfig(parameters, s)

            // Admin Token Sale Entrypoints
        |   SetWhitelistTimestamp(parameters)       -> setWhitelistTimestamp(parameters, s)
        |   AddToWhitelist(parameters)              -> addToWhitelist(parameters, s)
        |   RemoveFromWhitelist(parameters)         -> removeFromWhitelist(parameters, s)
        |   StartSale(_parameters)                  -> startSale(s)
        |   CloseSale(_parameters)                  -> closeSale(s)
        |   PauseSale(_parameters)                  -> pauseSale(s)

            // Token Sale Entrypoints
        |   BuyTokens(parameters)                   -> buyTokens(parameters, s)
        |   ClaimTokens(parameters)                 -> claimTokens(parameters, s)
        
    ]