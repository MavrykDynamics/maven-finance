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

// Delegation Type for updateConfig
#include "../partials/contractTypes/delegationTypes.ligo"

// Doorman Type for updateConfig
#include "../partials/contractTypes/doormanTypes.ligo"

// Aggregator Type
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Aggregator Factory Type
#include "../partials/contractTypes/aggregatorFactoryTypes.ligo"


// Farm Type
#include "../partials/contractTypes/farmTypes.ligo"

// Treasury Type for mint and transfers
#include "../partials/contractTypes/treasuryTypes.ligo"

// Emergency Governance Type
#include "../partials/contractTypes/emergencyGovernanceTypes.ligo"

// Council Type
#include "../partials/contractTypes/councilTypes.ligo"

// Governance Type
#include "../partials/contractTypes/governanceTypes.ligo"

// Governance Financial Type
#include "../partials/contractTypes/governanceFinancialTypes.ligo"

// Governance Satellite Type
#include "../partials/contractTypes/governanceSatelliteTypes.ligo"

// Break Glass Type
#include "../partials/contractTypes/breakGlassTypes.ligo"

// Farm Type
#include "../partials/contractTypes/farmTypes.ligo"

// FarmFactory Type
#include "../partials/contractTypes/farmFactoryTypes.ligo"

// Treasury Type
#include "../partials/contractTypes/treasuryTypes.ligo"

// TreasuryFactory Type
#include "../partials/contractTypes/treasuryFactoryTypes.ligo"

// Aggregator Type
#include "../partials/contractTypes/aggregatorTypes.ligo"

// AggregatorFactory Type
#include "../partials/contractTypes/aggregatorFactoryTypes.ligo"

// Vault Types 
#include "../partials/contractTypes/vaultTypes.ligo"

// LendingController Type
#include "../partials/contractTypes/lendingControllerTypes.ligo"

// Governance Proxy Types
#include "../partials/contractTypes/governanceProxyTypes.ligo"
// ------------------------------------------------------------------------------

type proxyHelperStorageType is [@layout:comb] record [
    admin : address;
]


type proxyHelperAction is 
        
        // Main entrypoints
    |   GovernanceProxyHelper           of governanceProxyLambdaActionType
    |   Empty                           of (unit)

const noOperations : list (operation) = nil;
type return is list (operation) * proxyHelperStorageType


// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

function governanceProxyHelper(const _governanceAction : governanceProxyLambdaActionType; const s : proxyHelperStorageType) : return is 
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
        |   GovernanceProxyHelper(parameters)       -> governanceProxyHelper(parameters, s)   
        |   Empty(_parameters)                      -> empty(s)

    ]
)
