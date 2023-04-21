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

// MVKFaucet types 
#include "../partials/contractTypes/mvkFaucetTypes.ligo"

// ------------------------------------------------------------------------------

type action is

        // Default Entrypoint to Receive Tez
        Default     of unit

        // Housekeeping Entrypoints
    |   RequestMvk  of unit


type return is list (operation) * mvkFaucetStorageType
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

function verifyUserPreviousMvkRequest(var s : mvkFaucetStorageType) : unit is
block {

    if Big_map.mem(Tezos.get_sender(), s.requesters) 
    then failwith("MVK_REQUEST_LIMIT_REACHED")

} with unit

function saveUserMvkRequest(var s : mvkFaucetStorageType) : mvkFaucetStorageType is
block {

    s.requesters    := Big_map.update(Tezos.get_sender(), Some(unit), s.requesters);

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

(* requestMvk entrypoint *)
function requestMvk(var s : mvkFaucetStorageType) : return is
block {

    // verify user didn't already make a request
    verifyUserPreviousMvkRequest(s);

    // save user request in the storage
    s   := saveUserMvkRequest(s);

    // assign params to constants for better code readability
    const from_: address                = Tezos.get_self_address();
    const to_: address                  = Tezos.get_sender();
    const amountPerUser: nat            = s.amountPerUser;
    const tokenId: nat                  = 0n;
    const tokenContractAddress: address = s.mvkTokenAddress;

    // create the transfer operation
    const operations: list(operation)   = list[
        transferFa2Token(
            from_,
            to_,
            amountPerUser,
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
function main (const action : action; const s : mvkFaucetStorageType) : return is
block{

    verifyNoAmountSent(Unit); // // entrypoints should not receive any tez amount  

} with(
    
    case action of [
            
            // Default Entrypoint to Receive Tez
            Default(_parameters)                -> ((nil : list(operation)), s)
            
            // Housekeeping Entrypoints
        |   RequestMvk (_params)                -> requestMvk(s)

    ]

)
