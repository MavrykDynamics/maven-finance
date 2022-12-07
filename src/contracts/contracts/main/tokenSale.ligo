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
    |   SetGovernance               of address
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


// ------------------------------------------------------------------------------
// Constants specific for Token Sale
// ------------------------------------------------------------------------------

const oneDayInSeconds : int = 86_400;
const onePeriodInSeconds : int = 2_592_000;

const fpa10e24 : nat = 1_000_000_000_000_000_000_000_000n;       // 10^24
const fpa10e18 : nat = 1_000_000_000_000_000_000n;               // 10^18
const fpa10e15 : nat = 1_000_000_000_000_000n;                   // 10^15
const fpaMvk   : nat = 1_000_000_000n;                           // 10^9

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



function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to send transfer operation to treasury
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
[@view] function checkWhitelistByAddressOpt(const userAddress: address; var s : tokenSaleStorageType) : option(unit) is
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
    
    verifyNoAmountSent(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;

} with (noOperations, s)



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : tokenSaleStorageType) : return is
block {
    
    verifyNoAmountSent(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    s.governanceAddress := newGovernanceAddress;

} with (noOperations, s)



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : tokenSaleStorageType) : return is
block {
    
    verifyNoAmountSent(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin

    const metadataKey   : string = updateMetadataParams.metadataKey;
    const metadataHash  : bytes  = updateMetadataParams.metadataHash;
    
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

} with (noOperations, s)



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : tokenSaleUpdateConfigParamsType; var s : tokenSaleStorageType) : return is 
block {

    // entrypoint should not receive any tez amount
    verifyNoAmountSent(Unit);

    // check that sender is admin
    checkSenderIsAdmin(s);

    const updateConfigAction    : tokenSaleUpdateConfigActionType   = updateConfigParams.updateConfigAction;
    const updateConfigNewValue  : tokenSaleUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

    case updateConfigAction of [
            ConfigMaxAmountPerWalletTotal   (_buyOptionIndex)    -> case s.config.buyOptions[_buyOptionIndex] of [
                        Some (_buyOption)   -> block{
                                var buyOptionConfig : tokenSaleOptionType   := _buyOption;
                                buyOptionConfig.maxAmountPerWalletTotal     := updateConfigNewValue;
                                s.config.buyOptions[_buyOptionIndex]        := buyOptionConfig;
                            }
                    |   None                -> failwith(error_BUY_OPTION_NOT_FOUND)
                ]
        |   ConfigWhitelistMaxAmountTotal   (_buyOptionIndex)    -> case s.config.buyOptions[_buyOptionIndex] of [
                        Some (_buyOption)   -> block{
                                var buyOptionConfig : tokenSaleOptionType   := _buyOption;
                                buyOptionConfig.whitelistMaxAmountTotal     := updateConfigNewValue;
                                s.config.buyOptions[_buyOptionIndex]        := buyOptionConfig;
                            }
                    |   None                -> failwith(error_BUY_OPTION_NOT_FOUND)
                ]
        |   ConfigMaxAmountCap              (_buyOptionIndex)    -> case s.config.buyOptions[_buyOptionIndex] of [
                        Some (_buyOption)   -> block{
                                var buyOptionConfig : tokenSaleOptionType   := _buyOption;
                                buyOptionConfig.maxAmountCap                := updateConfigNewValue;
                                s.config.buyOptions[_buyOptionIndex]        := buyOptionConfig;
                            }
                    |   None                -> failwith(error_BUY_OPTION_NOT_FOUND)
                ]
        |   ConfigVestingPeriods            (_buyOptionIndex)   -> case s.config.buyOptions[_buyOptionIndex] of [
                        Some (_buyOption)   -> block{
                                var buyOptionConfig : tokenSaleOptionType   := _buyOption;
                                buyOptionConfig.vestingPeriods              := updateConfigNewValue;
                                s.config.buyOptions[_buyOptionIndex]        := buyOptionConfig;
                            }
                    |   None                -> failwith(error_BUY_OPTION_NOT_FOUND)
                ]
        |   ConfigTokenXtzPrice             (_buyOptionIndex)   -> case s.config.buyOptions[_buyOptionIndex] of [
                        Some (_buyOption)   -> block{
                                var buyOptionConfig : tokenSaleOptionType   := _buyOption;
                                buyOptionConfig.tokenXtzPrice               := (updateConfigNewValue * 1mutez);
                                s.config.buyOptions[_buyOptionIndex]        := buyOptionConfig;
                            }
                    |   None                -> failwith(error_BUY_OPTION_NOT_FOUND)
                ]
        |   ConfigMinMvkAmount              (_buyOptionIndex)   -> case s.config.buyOptions[_buyOptionIndex] of [
                        Some (_buyOption)   -> block{
                                var buyOptionConfig : tokenSaleOptionType   := _buyOption;
                                buyOptionConfig.minMvkAmount                := updateConfigNewValue;
                                s.config.buyOptions[_buyOptionIndex]        := buyOptionConfig;
                            }
                    |   None                -> failwith(error_BUY_OPTION_NOT_FOUND)
                ]
        |   ConfigVestingPeriodDurationSec  (_v)                ->  s.config.vestingPeriodDurationSec   := updateConfigNewValue
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

    verifyNoAmountSent(Unit);   // entrypoint should not receive any tez amount  
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

    verifyNoAmountSent(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin

    // loop to add user addresses to whitelist
    for newUserAddress in list userAddressList block {
        s.whitelistedAddresses[newUserAddress] := Unit;
    }

} with (noOperations, s)



(*  removeFromWhitelist entrypoint *)
function removeFromWhitelist(const userAddressList : list(address); var s : tokenSaleStorageType) : return is
block {

    verifyNoAmountSent(Unit);   // entrypoint should not receive any tez amount  
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
        claimCounter        = 0n;
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
    const amountPaid      : nat = Tezos.get_amount() / 1mutez;
    const tokenXtzPrice   : nat = buyOptionConfig.tokenXtzPrice / 1mutez;
    const elligibleAmount : nat = ((amountPaid * fpaMvk) / tokenXtzPrice);
    if elligibleAmount =/= amountBought
    then failwith(error_MVK_PAY_AMOUNT_NOT_MET) 
    else skip;

    // init operations
    var operations : list(operation) := nil;

    // check if whitelist sale has started
    if Tezos.get_now() < s.whitelistStartTimestamp
    then failwith(error_WHITELIST_SALE_HAS_NOT_STARTED) 
    else if Tezos.get_now() < s.whitelistEndTimestamp then {
        // whitelist sale has started
        // check if user is whitelisted
        if checkInWhitelistAddresses(Tezos.get_sender(), s) then skip else failwith(error_USER_IS_NOT_WHITELISTED);

        // check if max amount per whitelist wallet has been exceeded for current option
        if userTokenSaleOptionRecord.tokenBought + amountBought > buyOptionConfig.whitelistMaxAmountTotal then failwith(error_MAX_AMOUNT_WHITELIST_WALLET_EXCEEDED) else skip;
    } else skip;

    // check if minimum amount has been bought
    if userTokenSaleOptionRecord.tokenBought + amountBought < buyOptionConfig.minMvkAmount then failwith(error_MIN_MVK_AMOUNT_NOT_REACHED) else skip;

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
    const tokenSaleEndTimestamp       : timestamp                       = s.tokenSaleEndTimestamp;
    var operations                    : list(operation)                 := nil;

    // init MVK token type to be used in transfer params
    const mvkTokenType : tokenType  = Fa2(record [
        tokenContractAddress  = s.mvkTokenAddress;
        tokenId               = 0n;
    ]);

    // get the user buy record
    var userBuyOptions : tokenSaleRecordType    := case s.tokenSaleLedger[user] of [
            Some (_userRecord)  ->_userRecord
        |   None                -> failwith(error_USER_TOKEN_SALE_RECORD_NOT_FOUND)
    ];

    // register claim
    for buyOptionIndex -> userBuyOption in map userBuyOptions {

        // init params
        var tokenSaleUserOption : tokenSaleUserOptionType   := userBuyOption;

        // get buy option config
        const _buyOptionConfig : tokenSaleOptionType        = case Map.find_opt(buyOptionIndex, s.config.buyOptions) of [
                Some (_option)  -> _option
            |   None            -> failwith(error_BUY_OPTION_NOT_FOUND)
        ];

        // process claim - skip if fully claimed (periods claimed = vesting periods)  
        if tokenSaleUserOption.claimCounter = _buyOptionConfig.vestingPeriods then skip else block {

            // if first claim, match the lastClaimTimestamp to the token sale end
            if tokenSaleUserOption.lastClaimTimestamp =/= tokenSaleEndTimestamp then tokenSaleUserOption.lastClaimTimestamp := tokenSaleEndTimestamp else skip;

            // calculate periods passed since last claimed
            var periodsToClaim : nat    := if tokenSaleUserOption.lastClaimLevel = 0n then 1n else 0n;
            periodsToClaim              := periodsToClaim + (abs(today - tokenSaleUserOption.lastClaimTimestamp) / s.config.vestingPeriodDurationSec);
            periodsToClaim              := if periodsToClaim + tokenSaleUserOption.claimCounter > _buyOptionConfig.vestingPeriods then abs(_buyOptionConfig.vestingPeriods - tokenSaleUserOption.claimCounter) else periodsToClaim;

            // account for case where there is no vesting periods for option one (least restrictive option)
            var tokenAmountSinglePeriod : nat    := if _buyOptionConfig.vestingPeriods = 0n then 
                tokenSaleUserOption.tokenBought
            else 
                tokenSaleUserOption.tokenBought / _buyOptionConfig.vestingPeriods;

            // check that user's max tokens claimable is not exceeded
            const maxTokenAmount : nat  = tokenSaleUserOption.tokenBought;
            if tokenSaleUserOption.tokenClaimed + tokenAmountSinglePeriod > maxTokenAmount then failwith(error_MAX_AMOUNT_CLAIMED) else skip;

            // calculate final value token amount to be claimed
            var tokenAmount : nat       := tokenAmountSinglePeriod * periodsToClaim;

            // claim the dust if it is the last period
            const finalClaimCounter : nat       = tokenSaleUserOption.claimCounter + periodsToClaim;
            const estimatedTokenClaimed : nat   = tokenSaleUserOption.tokenClaimed + tokenAmount;
            if finalClaimCounter = _buyOptionConfig.vestingPeriods and estimatedTokenClaimed < tokenSaleUserOption.tokenBought 
            then tokenAmount    := tokenAmount + abs(tokenSaleUserOption.tokenBought - estimatedTokenClaimed)
            else skip;

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
            tokenSaleUserOption.claimCounter            := finalClaimCounter;
            tokenSaleUserOption.tokenClaimed            := tokenSaleUserOption.tokenClaimed + tokenAmount;
            tokenSaleUserOption.lastClaimTimestamp      := Tezos.get_now();
            tokenSaleUserOption.lastClaimLevel          := Tezos.get_level();
            userBuyOptions[buyOptionIndex]              := tokenSaleUserOption;
        }
    };

    // Save the buy option in the storage
    s.tokenSaleLedger[user] := userBuyOptions;

} with (operations, s)



(*  startSale entrypoint *)
function startSale(var s : tokenSaleStorageType) : return is
block {
    
    verifyNoAmountSent(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin

    // check for close
    if s.tokenSaleHasEnded then failwith(error_TOKEN_SALE_HAS_ENDED) else skip;
    
    s.tokenSaleHasStarted     := True;
    s.tokenSaleHasEnded       := False;
    
} with (noOperations, s)



(*  closeSale entrypoint *)
function closeSale(var s : tokenSaleStorageType) : return is
block {
    
    verifyNoAmountSent(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin

    // check for start
    if not s.tokenSaleHasStarted then failwith(error_TOKEN_SALE_HAS_NOT_STARTED) else skip;

    s.tokenSaleHasEnded       := True;
    s.tokenSaleEndTimestamp   := Tezos.get_now();
    s.tokenSaleEndBlockLevel  := Tezos.get_level();

} with (noOperations, s)



(*  pauseSale entrypoint *)
function pauseSale(var s : tokenSaleStorageType) : return is
block {
    
    verifyNoAmountSent(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin

    // check for close
    if s.tokenSaleHasEnded then failwith(error_TOKEN_SALE_HAS_ENDED) else skip;

    // if sale is paused, then unpause sale, and vice versa
    s.tokenSalePaused   := not s.tokenSalePaused;
    
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
        |   SetGovernance(parameters)               -> setGovernance(parameters, s)
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
