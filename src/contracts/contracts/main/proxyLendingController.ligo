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

// Common Entrypoints
#include "../partials/shared/commonEntrypoints.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Mavryk FA2 Token Types 
#include "../partials/contractTypes/mavrykFa2TokenTypes.ligo"

// Doorman Types
#include "../partials/contractTypes/doormanTypes.ligo"

// Aggregator Types - for lastCompletedRoundPriceReturnType
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Vault Types 
#include "../partials/contractTypes/vaultTypes.ligo"

// LendingController Type
#include "../partials/contractTypes/lendingControllerTypes.ligo"

// ------------------------------------------------------------------------------

type proxyHelperStorageType is [@layout:comb] record [
    admin : address;
]


type proxyHelperAction is 
        
        // Main entrypoints
    |   LendingControllerHelper         of lendingControllerLambdaActionType
    |   Empty                           of (unit)

const noOperations : list (operation) = nil;
type return is list (operation) * proxyHelperStorageType


// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------


function lendingControllerHelper(const _governanceAction : lendingControllerLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)


function empty(const s : proxyHelperStorageType) : return is 
    (noOperations, s)

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : proxyHelperAction; const s : proxyHelperStorageType) : return is 
block {

    verifyNoAmountSent(Unit); // entrypoints should not receive any tez amount  

} with (

    case action of [
            
            // Main entrypoints
        |   LendingControllerHelper(parameters)     -> lendingControllerHelper(parameters, s)  
        |   Empty(_parameters)                      -> empty(s)
    ]
)
