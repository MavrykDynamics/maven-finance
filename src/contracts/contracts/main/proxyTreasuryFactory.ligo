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

// MvkToken Types
#include "../partials/contractTypes/mvkTokenTypes.ligo"

// Treasury Types
#include "../partials/contractTypes/treasuryTypes.ligo"

// TreasuryFactory Types
#include "../partials/contractTypes/treasuryFactoryTypes.ligo"

// ------------------------------------------------------------------------------

type proxyHelperStorageType is [@layout:comb] record [
    admin : address;
]


type proxyHelperAction is 
        
        // Main entrypoints
    |   TreasuryFactoryHelper           of treasuryFactoryLambdaActionType
    

const noOperations : list (operation) = nil;
type return is list (operation) * proxyHelperStorageType


// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------


function treasuryFactoryHelper(const _governanceAction : treasuryFactoryLambdaActionType; const s : proxyHelperStorageType) : return is 
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
        |   TreasuryFactoryHelper(parameters)       -> treasuryFactoryHelper(parameters, s)   
        
    ]
)
