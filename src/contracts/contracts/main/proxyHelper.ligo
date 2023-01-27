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


// Doorman Types
#include "../partials/contractTypes/doormanTypes.ligo"

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// Council Types
#include "../partials/contractTypes/councilTypes.ligo"

// Vesting Types
#include "../partials/contractTypes/vestingTypes.ligo"

// Emergency Governance Type
#include "../partials/contractTypes/emergencyGovernanceTypes.ligo"


// Farm Types
#include "../partials/contractTypes/farmTypes.ligo"

// Farm Factory Type
#include "../partials/contractTypes/farmFactoryTypes.ligo"


// Treasury Types
#include "../partials/contractTypes/treasuryTypes.ligo"

// TreasuryFactory Types
#include "../partials/contractTypes/treasuryFactoryTypes.ligo"


// Aggregator Types
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Aggregator Factory Types
#include "../partials/contractTypes/aggregatorFactoryTypes.ligo"


// Vault Types 
#include "../partials/contractTypes/vaultTypes.ligo"

// Vault Factory Types 
#include "../partials/contractTypes/vaultFactoryTypes.ligo"


// Governance Types
#include "../partials/contractTypes/governanceTypes.ligo"

// Break Glasss Type
#include "../partials/contractTypes/breakGlassTypes.ligo"

// Governance Financial Type
#include "../partials/contractTypes/governanceFinancialTypes.ligo"

// Governance Satellite Type
#include "../partials/contractTypes/governanceSatelliteTypes.ligo"

// Governance Proxy Types
#include "../partials/contractTypes/governanceProxyTypes.ligo"



// LendingController Type
#include "../partials/contractTypes/lendingControllerTypes.ligo"

// ------------------------------------------------------------------------------

type proxyHelperStorageType is [@layout:comb] record [
    admin : address;
]


type proxyHelperAction is 
        
        // Main entrypoints
    |   DoormanHelper                   of doormanLambdaActionType
    // |   DelegationHelper                of delegationLambdaActionType
    // |   CouncilHelper                   of councilLambdaActionType
    // |   VestingHelper                   of vestingLambdaActionType
    // |   BreakGlassHelper                of breakGlassLambdaActionType

    // |   EmergencyGovernanceHelper       of emergencyGovernanceLambdaActionType
    // |   FarmHelper                      of farmLambdaActionType
    // |   FarmFactoryHelper               of farmFactoryLambdaActionType
    // |   TreasuryHelper                  of treasuryLambdaActionType
    // |   TreasuryFactoryHelper           of treasuryFactoryLambdaActionType
    
    // |   AggregatorHelper                of aggregatorLambdaActionType
    // |   AggregatorFactoryHelper         of aggregatorFactoryLambdaActionType
    // |   VaultHelper                     of vaultLambdaActionType
    // |   VaultFactoryHelper              of vaultFactoryLambdaActionType
    // |   GovernanceHelper                of governanceLambdaActionType
    
    // |   GovernanceFinancialHelper       of governanceFinancialLambdaActionType
    // |   GovernanceSatelliteHelper       of governanceSatelliteLambdaActionType
    // |   GovernanceProxyHelper           of governanceProxyLambdaActionType
    // |   LendingControllerHelper         of lendingControllerLambdaActionType


const noOperations : list (operation) = nil;
type return is list (operation) * proxyHelperStorageType


// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

function doormanHelper(const _governanceAction : doormanLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function delegationHelper(const _governanceAction : delegationLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function councilHelper(const _governanceAction : councilLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function vestingHelper(const _governanceAction : vestingLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function breakGlassHelper(const _governanceAction : breakGlassLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function emergencyGovernanceHelper(const _governanceAction : emergencyGovernanceLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function farmHelper(const _governanceAction : farmLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function farmFactoryHelper(const _governanceAction : farmFactoryLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function treasuryHelper(const _governanceAction : treasuryLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function treasuryFactoryHelper(const _governanceAction : treasuryFactoryLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function aggregatorHelper(const _governanceAction : aggregatorLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function aggregatorFactoryHelper(const _governanceAction : aggregatorFactoryLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function vaultHelper(const _governanceAction : vaultLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function vaultFactoryHelper(const _governanceAction : vaultFactoryLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function governanceHelper(const _governanceAction : governanceLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function governanceFinancialHelper(const _governanceAction : governanceFinancialLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function governanceSatelliteHelper(const _governanceAction : governanceSatelliteLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function governanceProxyHelper(const _governanceAction : governanceProxyLambdaActionType; const s : proxyHelperStorageType) : return is 
    (noOperations, s)



function lendingControllerHelper(const _governanceAction : lendingControllerLambdaActionType; const s : proxyHelperStorageType) : return is 
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
        |   DoormanHelper(parameters)               -> doormanHelper(parameters, s)
        // |   DelegationHelper(parameters)            -> delegationHelper(parameters, s)
        // |   CouncilHelper(parameters)               -> councilHelper(parameters, s)
        // |   VestingHelper(parameters)               -> vestingHelper(parameters, s)
        // |   BreakGlassHelper(parameters)            -> breakGlassHelper(parameters, s)
        
        // |   EmergencyGovernanceHelper(parameters)   -> emergencyGovernanceHelper(parameters, s)   
        // |   FarmHelper(parameters)                  -> farmHelper(parameters, s)   
        // |   FarmFactoryHelper(parameters)           -> farmFactoryHelper(parameters, s)   
        // |   TreasuryHelper(parameters)              -> treasuryHelper(parameters, s)   
        // |   TreasuryFactoryHelper(parameters)       -> treasuryFactoryHelper(parameters, s)   
        
        // |   AggregatorHelper(parameters)            -> aggregatorHelper(parameters, s)   
        // |   AggregatorFactoryHelper(parameters)     -> aggregatorFactoryHelper(parameters, s)   
        // |   VaultHelper(parameters)                 -> vaultHelper(parameters, s)   
        // |   VaultFactoryHelper(parameters)          -> vaultFactoryHelper(parameters, s)   
        // |   GovernanceHelper(parameters)            -> governanceHelper(parameters, s)   
        
        // |   GovernanceFinancialHelper(parameters)   -> governanceFinancialHelper(parameters, s)   
        // |   GovernanceSatelliteHelper(parameters)   -> governanceSatelliteHelper(parameters, s)   
        // |   GovernanceProxyHelper(parameters)       -> governanceProxyHelper(parameters, s)   
        // |   LendingControllerHelper(parameters)     -> lendingControllerHelper(parameters, s)  

    ]
)
