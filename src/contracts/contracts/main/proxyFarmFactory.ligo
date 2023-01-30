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

// Farm Types
#include "../partials/contractTypes/farmTypes.ligo"

// Farm Factory Type
#include "../partials/contractTypes/farmFactoryTypes.ligo"


// ------------------------------------------------------------------------------

type proxyHelperStorageType is [@layout:comb] record [
    admin : address;
]


type proxyHelperAction is 
        
        // Main entrypoints
    |   FarmFactoryHelper               of farmFactoryLambdaActionType

    
const noOperations : list (operation) = nil;
type return is list (operation) * proxyHelperStorageType


// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------


function farmFactoryHelper(const _governanceAction : farmFactoryLambdaActionType; const s : proxyHelperStorageType) : return is 
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
        |   FarmFactoryHelper(parameters)           -> farmFactoryHelper(parameters, s)   

    ]
)
