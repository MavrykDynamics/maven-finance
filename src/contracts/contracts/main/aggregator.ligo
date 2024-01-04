// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Helpers and Types
// ------------------------------------------------------------------------------

// Constants
#include "../partials/shared/constants.ligo"

// Shared Helpers
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Helpers
#include "../partials/shared/transferHelpers.ligo"

// Permission Helpers
#include "../partials/shared/permissionHelpers.ligo"

// Votes Helpers
#include "../partials/shared/voteHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// Governance Types
#include "../partials/contractTypes/governanceTypes.ligo"

// Governance Satellite Types
#include "../partials/contractTypes/governanceSatelliteTypes.ligo"

// Aggregator Types
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Aggregator Factory Types
#include "../partials/contractTypes/aggregatorFactoryTypes.ligo"

// ------------------------------------------------------------------------------

type aggregatorAction is

        // Housekeeping Entrypoints
    |   SetAdmin                             of (address)
    |   SetGovernance                        of (address)
    |   SetName                              of (string)
    |   UpdateMetadata                       of updateMetadataType
    |   UpdateConfig                         of aggregatorUpdateConfigParamsType
    |   UpdateWhitelistContracts             of updateWhitelistContractsType
    |   UpdateGeneralContracts               of updateGeneralContractsType
    |   MistakenTransfer                     of transferActionType

        // Admin Oracle Entrypoints
    |   AddOracle                            of addOracleType
    |   UpdateOracle                         of (unit)
    |   RemoveOracle                         of address

        // Pause / Break Glass Entrypoints
    |   PauseAll                             of (unit)
    |   UnpauseAll                           of (unit)
    |   TogglePauseEntrypoint                of aggregatorTogglePauseEntrypointType

        // Oracle Entrypoints
    |   UpdateData                           of updateDataType
    
        // Reward Entrypoints
    |   WithdrawRewardXtz                    of withdrawRewardXtzType
    |   WithdrawRewardStakedMvn              of withdrawRewardStakedMvnType

        // Lambda Entrypoints
    |   SetLambda                            of setLambdaType
  

const noOperations : list (operation) = nil;
type return is list (operation) * aggregatorStorageType

// aggregator contract methods lambdas
type aggregatorUnpackLambdaFunctionType is (aggregatorLambdaActionType * aggregatorStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// Aggregator Helpers:
#include "../partials/contractHelpers/aggregatorHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// Aggregator Views:
#include "../partials/contractViews/aggregatorViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// Aggregator Lambdas :
#include "../partials/contractLambdas/aggregatorLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// Aggregator Entrypoints:
#include "../partials/contractEntrypoints/aggregatorEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : aggregatorAction; const s : aggregatorStorageType) : return is
block {

    verifyNoAmountSent(Unit); // entrypoints should not receive any tez amount  

} with(
    case action of [
        
            // Housekeeping Entrypoints
        |   SetAdmin (parameters)                           -> setAdmin(parameters, s)
        |   SetGovernance (parameters)                      -> setGovernance(parameters, s) 
        |   SetName (parameters)                            -> setName(parameters, s) 
        |   UpdateMetadata (parameters)                     -> updateMetadata(parameters, s)
        |   UpdateConfig (parameters)                       -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts (parameters)           -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts (parameters)             -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer (parameters)                   -> mistakenTransfer(parameters, s)

            // Admin Oracle Entrypoints
        |   AddOracle (parameters)                          -> addOracle(parameters, s)
        |   UpdateOracle (_parameters)                      -> updateOracle(s)
        |   RemoveOracle (parameters)                       -> removeOracle(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll (_parameters)                          -> pauseAll(s)
        |   UnpauseAll (_parameters)                        -> unpauseAll(s)
        |   TogglePauseEntrypoint (parameters)              -> togglePauseEntrypoint(parameters, s)

            // Oracle Entrypoints
        |   UpdateData (parameters)                         -> updateData(parameters, s)

            // Reward Entrypoints
        |   WithdrawRewardXtz (parameters)                  -> withdrawRewardXtz(parameters, s)
        |   WithdrawRewardStakedMvn (parameters)            -> withdrawRewardStakedMvn(parameters, s)

            // Lambda Entrypoints
        |   SetLambda (parameters)                          -> setLambda(parameters, s)
    ]
);
