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
        |   ExecuteGovernanceAction(parameters)       -> executeGovernanceAction(parameters, s)
        |   ProcessGovernanceAction(parameters)       -> processGovernanceAction(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                     -> setLambda(parameters, s)

    ]
)
