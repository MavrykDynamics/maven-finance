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

// Governance Proxy Types
#include "../partials/contractTypes/governanceProxyTypes.ligo"

// ------------------------------------------------------------------------------

type governanceProxyAction is 
        
        // Housekeeping Entrypoints
        SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateMetadata                  of updateMetadataType
    |   UpdateWhitelistContracts        of updateWhitelistContractsType
    |   UpdateGeneralContracts          of updateGeneralContractsType
    |   UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsType
    |   MistakenTransfer                of transferActionType

        // Main entrypoints
    |   ExecuteGovernanceAction         of executeGovernanceActionType
    |   ProcessGovernanceAction         of processGovernanceActionType

        // Lambda Entrypoints
    |   SetLambda                       of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * governanceProxyStorageType

// proxy lambdas -> executing proposals to external contracts within MAVRYK system
type governanceProxyProxyLambdaFunctionType is (executeGovernanceActionType * governanceProxyStorageType) -> return

// governance proxy contract methods lambdas
type governanceProxyUnpackLambdaFunctionType is (governanceProxyLambdaActionType * governanceProxyStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// GovernanceProxy Helpers:
#include "../partials/contractHelpers/governanceProxyHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// GovernanceProxy Views:
#include "../partials/contractViews/governanceProxyViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// GovernanceProxy Lambdas :
#include "../partials/contractLambdas/governanceProxyLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// GovernanceProxy Entrypoints:
#include "../partials/contractEntrypoints/governanceProxyEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : governanceProxyAction; const s : governanceProxyStorageType) : return is 
block {

    verifyNoAmountSent(Unit); // entrypoints should not receive any tez amount  

} with (

    case action of [
            
            // Housekeeping entrypoints
            SetAdmin(parameters)                      -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                 -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)                -> updateMetadata(parameters, s)
        |   UpdateWhitelistContracts(parameters)      -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)        -> updateGeneralContracts(parameters, s)
        |   UpdateWhitelistTokenContracts(parameters) -> updateWhitelistTokenContracts(parameters, s)
        |   MistakenTransfer(parameters)              -> mistakenTransfer(parameters, s)

            // Main entrypoints
        |   ProcessGovernanceAction(parameters)       -> processGovernanceAction(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                     -> setLambda(parameters, s)

    ]
)
