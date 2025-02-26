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

// MVNFaucet types 
#include "../partials/contractTypes/mvnFaucetTypes.ligo"

// ------------------------------------------------------------------------------

type action is

        // Default Entrypoint to Receive Mav
        Default         of unit
            
        // Housekeeping Entrypoints
    |   UpdateToken     of updateTokenType
    |   RemoveToken     of removeTokenType

        // Entrypoints
    |   RequestToken    of requestTokenType


type return is list (operation) * mvnFaucetStorageType
const noOperations : list (operation) = nil;
const zeroAddress : address = "mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d";

// ------------------------------------------------------------------------------
//
// Constants End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

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
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

(* updateToken entrypoint *)
function updateToken(const updateTokenParams : updateTokenType; var s : mvnFaucetStorageType) : return is
block {
    // entrypoints should not receive any mav amount  
    verifyNoAmountSent(Unit);

    verifySenderIsAdmin(s.admin);

    // Update token record
    s.tokens := Big_map.update(updateTokenParams.tokenIdentifier, Some(updateTokenParams.maxAmountPerUser), s.tokens);

} with (noOperations, s)

(* removeToken entrypoint *)
function removeToken(const removeTokenParams : tokenIdentifierType; var s : mvnFaucetStorageType) : return is
block {
    // entrypoints should not receive any mav amount  
    verifyNoAmountSent(Unit);

    verifySenderIsAdmin(s.admin);

    // Remove token record
    s.tokens := Big_map.remove(removeTokenParams, s.tokens);

} with (noOperations, s)

(* requestToken entrypoint *)
function requestToken(const requestTokenParams : requestTokenType; var s : mvnFaucetStorageType) : return is
block {

    // entrypoints should not receive any mav amount  
    verifyNoAmountSent(Unit);

    // Parse parameters
    const tokenIdentifier : tokenIdentifierType = requestTokenParams.tokenIdentifier;
    const tokenAmount : nat                     = requestTokenParams.tokenAmount;
    const userAddress : address                 = requestTokenParams.userAddress;

    // Check token amount doesn't exceed maximum
    const maxTokenPerUser : nat = case Big_map.find_opt(tokenIdentifier, s.tokens) of [
            Some (_v) -> _v
        |   None      -> 0n
    ];
    if (tokenAmount > maxTokenPerUser) then
    failwith("TOKEN_REQUEST_EXCEEDS_MAXIMUM_ALLOWED");

    // assign params to constants for better code readability
    const from_: address                = Mavryk.get_self_address();
    const tokenId: nat                  = tokenIdentifier.1;
    const tokenContractAddress: address = tokenIdentifier.0;

    // check whether to send token or mvrk
    var operations: list(operation)   := list[];
    if tokenContractAddress = zeroAddress then{
        // Check balance
        const selfBalance: nat = Mavryk.get_balance() / 1mumav;
        if selfBalance < tokenAmount then failwith ("ERROR_MVRK_BALANCE_TOO_LOW");

        // create tx
        operations := Mavryk.transaction(unit, tokenAmount * 1mumav, (Mavryk.get_contract_with_error(userAddress, "ERROR_CONTRACT_NOT_FOUND") : contract(unit))) # operations;
    }
    else{
        // Check balance
        const balanceView : option (nat) = Mavryk.call_view ("get_balance", (Mavryk.get_self_address(), 0n), tokenContractAddress);
        const selfBalance: nat = case balanceView of [
                Some (value) -> value
            |   None         -> tokenAmount
        ];
        if selfBalance < tokenAmount then failwith ("ERROR_MVN_BALANCE_TOO_LOW");

        // create tx
        operations := transferFa2Token(
            from_,
            userAddress,
            tokenAmount,
            tokenId,
            tokenContractAddress
        ) # operations;
    }

} with (operations, s)

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : action; const s : mvnFaucetStorageType) : return is
    case action of [
            
            // Default Entrypoint to Receive Mav
            Default(_parameters)                -> ((nil : list(operation)), s)
            
            // Housekeeping Entrypoints
        |   UpdateToken (params)               -> updateToken(params, s)
        |   RemoveToken (params)               -> removeToken(params, s)

            // Entrypoints
        |   RequestToken (params)              -> requestToken(params, s)

    ]
