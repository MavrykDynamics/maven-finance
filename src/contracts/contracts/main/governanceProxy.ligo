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

// Governance Proxy Types
#include "../partials/contractTypes/governanceProxyTypes.ligo"

// ------------------------------------------------------------------------------

type governanceProxyAction is

        // Housekeeping Entrypoints
        SetAdmin                of (address)
    |   SetGovernance           of (address)
    |   UpdateMetadata          of updateMetadataType
    |   MistakenTransfer        of transferActionType

        // Main Entrypoints
    |   ExecuteGovernanceAction of bytes
    |   DataPackingHelper       of unit -> list(operation)

        // Lambda Entrypoints
    |   SetLambda               of setLambdaType

type return is list (operation) * governanceProxyStorageType
const noOperations : list (operation) = nil;

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

    verifyNoAmountSent(Unit); // entrypoints should not receive any mav amount  

} with (

    case action of [

            // Housekeeping Entrypoints
            SetAdmin (parameters)               -> setAdmin(parameters, s)
        |   SetGovernance(parameters)           -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)          -> updateMetadata(parameters, s)
        |   MistakenTransfer(parameters)        -> mistakenTransfer(parameters, s)

            // Main Entrypoints
        |   ExecuteGovernanceAction(params)     -> executeGovernanceAction(params, s)
        |   DataPackingHelper(parameters)       -> dataPackingHelper(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)               -> setLambda(parameters, s)

    ]

)
