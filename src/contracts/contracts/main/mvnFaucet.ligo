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

// MVNFaucet types 
#include "../partials/contractTypes/mvnFaucetTypes.ligo"

// ------------------------------------------------------------------------------

type action is

        // Default Entrypoint to Receive Mav
        Default         of unit

        // Housekeeping Entrypoints
    |   RequestMvn      of unit
    |   RequestFakeUsdt of unit


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

function verifyUserPreviousMvnRequest(var s : mvnFaucetStorageType) : unit is
block {

    if Big_map.mem((Mavryk.get_sender(), (Mvn : requestVariantType)), s.requesters) 
    then failwith("MVN_REQUEST_LIMIT_REACHED")

} with unit

function verifyUserPreviousFakeUsdtRequest(var s : mvnFaucetStorageType) : unit is
block {

    if Big_map.mem((Mavryk.get_sender(), (FakeUsdt : requestVariantType)), s.requesters) 
    then failwith("FAKE_USDT_REQUEST_LIMIT_REACHED")

} with unit

function saveUserRequest(const request : requestVariantType; var s : mvnFaucetStorageType) : mvnFaucetStorageType is
block {

    s.requesters    := Big_map.update((Mavryk.get_sender(), request), Some(unit), s.requesters);

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

(* requestMvn entrypoint *)
function requestMvn(var s : mvnFaucetStorageType) : return is
block {

    // verify user didn't already make a request
    verifyUserPreviousMvnRequest(s);

    // save user request in the storage
    s   := saveUserRequest((Mvn : requestVariantType), s);

    // assign params to constants for better code readability
    const from_: address                = Mavryk.get_self_address();
    const to_: address                  = Mavryk.get_sender();
    const amountPerUser: nat            = s.mvnAmountPerUser;
    const tokenId: nat                  = 0n;
    const tokenContractAddress: address = s.mvnTokenAddress;

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

(* RequestFakeUSDt entrypoint *)
function requestFakeUsdt(var s : mvnFaucetStorageType) : return is
block {

    // verify user didn't already make a request
    verifyUserPreviousFakeUsdtRequest(s);

    // save user request in the storage
    s   := saveUserRequest((FakeUsdt : requestVariantType), s);

    // assign params to constants for better code readability
    const from_: address                = Mavryk.get_self_address();
    const to_: address                  = Mavryk.get_sender();
    const amountPerUser: nat            = s.fakeUsdtAmountPerUser;
    const tokenId: nat                  = 0n;
    const tokenContractAddress: address = s.fakeUsdtTokenAddress;

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
function main (const action : action; const s : mvnFaucetStorageType) : return is
block{

    verifyNoAmountSent(Unit); // // entrypoints should not receive any mav amount  

} with(
    
    case action of [
            
            // Default Entrypoint to Receive Mav
            Default(_parameters)                -> ((nil : list(operation)), s)
            
            // Housekeeping Entrypoints
        |   RequestMvn (_params)                -> requestMvn(s)
        |   RequestFakeUsdt (_params)           -> requestFakeUsdt(s)

    ]

)
