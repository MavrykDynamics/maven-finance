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


// Emergency Governance Type
#include "../partials/contractTypes/emergencyGovernanceTypes.ligo"


// ------------------------------------------------------------------------------

type proxyHelperStorageType is [@layout:comb] record [
    admin : address;
]


type proxyHelperAction is 
        
        // Main entrypoints
    |   EmergencyGovernanceHelper       of emergencyGovernanceLambdaActionType
    

const noOperations : list (operation) = nil;
type return is list (operation) * proxyHelperStorageType


// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------


function emergencyGovernanceHelper(const _governanceAction : emergencyGovernanceLambdaActionType; const s : proxyHelperStorageType) : return is 
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
        |   EmergencyGovernanceHelper(parameters)   -> emergencyGovernanceHelper(parameters, s)   
        
    ]
)
