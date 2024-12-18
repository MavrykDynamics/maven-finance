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

function getUserPreviousRequest(const userAddress : address; const tokenIdentifier : tokenIdentifierType; const s : mvnFaucetStorageType) : nat is
    case Big_map.find_opt((tokenIdentifier, userAddress), s.requesters) of [
            Some (_v) -> _v
        |   None      -> 0n
    ];

function saveUserRequest(const userAddress : address; const tokenIdentifier : tokenIdentifierType; const requestAmount : nat; var s : mvnFaucetStorageType) : mvnFaucetStorageType is
block {

    s.requesters    := Big_map.update((tokenIdentifier, userAddress), Some(requestAmount), s.requesters);

} with (s)

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

    verifySenderIsAdmin(s.admin);

    // Update token record
    s.tokens := Big_map.update(updateTokenParams.tokenIdentifier, Some(updateTokenParams.maxAmountPerUser), s.tokens);

} with (noOperations, s)

(* removeToken entrypoint *)
function removeToken(const removeTokenParams : tokenIdentifierType; var s : mvnFaucetStorageType) : return is
block {

    verifySenderIsAdmin(s.admin);

    // Remove token record
    s.tokens := Big_map.remove(removeTokenParams, s.tokens);

} with (noOperations, s)

(* requestToken entrypoint *)
function requestToken(const requestTokenParams : requestTokenType; var s : mvnFaucetStorageType) : return is
block {

    // Parse parameters
    const tokenIdentifier : tokenIdentifierType = requestTokenParams.tokenIdentifier;
    const tokenAmount : nat                     = requestTokenParams.tokenAmount;
    const userAddress : address                 = requestTokenParams.userAddress;

    // Get user request
    const userRequest : nat = tokenAmount + getUserPreviousRequest(userAddress, tokenIdentifier, s);

    // Check token amount doesn't exceed maximum
    const maxTokenPerUser : nat = case Big_map.find_opt(tokenIdentifier, s.tokens) of [
            Some (_v) -> _v
        |   None      -> 0n
    ];
    if (userRequest > maxTokenPerUser) then
    failwith("TOKEN_REQUEST_EXCEEDS_MAXIMUM_ALLOWED");

    // save user request in the storage
    s   := saveUserRequest(userAddress, tokenIdentifier, userRequest, s);

    // assign params to constants for better code readability
    const from_: address                = Mavryk.get_self_address();
    const tokenId: nat                  = tokenIdentifier.1;
    const tokenContractAddress: address = tokenIdentifier.0;

    // create the transfer operation
    const operations: list(operation)   = list[
        transferFa2Token(
            from_,
            userAddress,
            userRequest,
            tokenId,
            tokenContractAddress
        )
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : action; const s : mvnFaucetStorageType) : return is
block{

    verifyNoAmountSent(Unit); // // entrypoints should not receive any mav amount  

} with(
    
    case action of [
            
            // Default Entrypoint to Receive Mav
            Default(_parameters)                -> ((nil : list(operation)), s)
            
            // Housekeeping Entrypoints
        |   UpdateToken (params)               -> updateToken(params, s)
        |   RemoveToken (params)               -> removeToken(params, s)

            // Entrypoints
        |   RequestToken (params)              -> requestToken(params, s)

    ]

)
