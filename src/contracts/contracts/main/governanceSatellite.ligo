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

// Aggregator Types
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Governance Satellite Types
#include "../partials/contractTypes/governanceSatelliteTypes.ligo"

// ------------------------------------------------------------------------------


type governanceSatelliteAction is 
      
        // Housekeeping Actions
    |   SetAdmin                      of address
    |   SetGovernance                 of address
    |   UpdateMetadata                of updateMetadataType
    |   UpdateConfig                  of governanceSatelliteUpdateConfigParamsType
    |   UpdateWhitelistContracts      of updateWhitelistContractsType
    |   UpdateGeneralContracts        of updateGeneralContractsType
    |   MistakenTransfer              of transferActionType

        // Satellite Governance
    |   SuspendSatellite              of suspendSatelliteActionType
    |   BanSatellite                  of banSatelliteActionType
    |   RestoreSatellite              of restoreSatelliteActionType

        // Satellite Oracle Governance
    |   RemoveAllSatelliteOracles     of removeAllSatelliteOraclesActionType
    |   AddOracleToAggregator         of addOracleToAggregatorActionType
    |   RemoveOracleInAggregator      of removeOracleInAggregatorActionType

        // Aggregator Governance
    |   SetAggregatorReference        of setAggregatorReferenceType
    |   TogglePauseAggregator         of togglePauseAggregatorActionType

        // Mistaken Transfer Governance
    |   FixMistakenTransfer           of fixMistakenTransferParamsType

        // Governance Vote Actions
    |   DropAction                    of dropActionType
    |   VoteForAction                 of voteForActionType

        // Lambda Entrypoints
    |   SetLambda                     of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * governanceSatelliteStorageType

// governance satellite contract methods lambdas
type governanceSatelliteUnpackLambdaFunctionType is (governanceSatelliteLambdaActionType * governanceSatelliteStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// GovernanceSatellite Helpers:
#include "../partials/contractHelpers/governanceSatelliteHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// GovernanceSatellite Views:
#include "../partials/contractViews/governanceSatelliteViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// GovernanceSatellite Lambdas :
#include "../partials/contractLambdas/governanceSatelliteLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// GovernanceSatellite Entrypoints:
#include "../partials/contractEntrypoints/governanceSatelliteEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : governanceSatelliteAction; const s : governanceSatelliteStorageType) : return is
block{

    verifyNoAmountSent(Unit); // entrypoints should not receive any tez amount  

} with (
    
    case action of [

            // Housekeeping Actions
        |   SetAdmin(parameters)                      -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                 -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)                -> updateMetadata(parameters, s)  
        |   UpdateConfig(parameters)                  -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)      -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)        -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer(parameters)              -> mistakenTransfer(parameters, s)

            // Satellite Governance 
        |   SuspendSatellite(parameters)              -> suspendSatellite(parameters, s)
        |   BanSatellite(parameters)                  -> banSatellite(parameters, s)
        |   RestoreSatellite(parameters)              -> restoreSatellite(parameters, s)

            // Satellite Oracle Governance
        |   RemoveAllSatelliteOracles(parameters)     -> removeAllSatelliteOracles(parameters, s)
        |   AddOracleToAggregator(parameters)         -> addOracleToAggregator(parameters, s)
        |   RemoveOracleInAggregator(parameters)      -> removeOracleInAggregator(parameters, s)

            // Aggregator Governance
        |   SetAggregatorReference(parameters)        -> setAggregatorReference(parameters, s)
        |   TogglePauseAggregator(parameters)         -> togglePauseAggregator(parameters, s)

            // Mistaken Transfer Governance
        |   FixMistakenTransfer(parameters)           -> fixMistakenTransfer(parameters, s)

            // Governance Actions
        |   DropAction(parameters)                    -> dropAction(parameters, s)
        |   VoteForAction(parameters)                 -> voteForAction(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                     -> setLambda(parameters, s)
    ]
)
