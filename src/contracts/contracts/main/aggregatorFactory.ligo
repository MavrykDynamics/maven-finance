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

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// Governance Satellite Types
#include "../partials/contractTypes/governanceSatelliteTypes.ligo"

// Aggregator Types
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Aggregator Factory Types
#include "../partials/contractTypes/aggregatorFactoryTypes.ligo"

// ------------------------------------------------------------------------------


type createAggregatorFuncType is (option(key_hash) * mav * aggregatorStorageType) -> (operation * address);
const createAggregatorFunc: createAggregatorFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/aggregator.mv"
        ;
          PAIR } |}
: createAggregatorFuncType)];

type aggregatorFactoryAction is
    
        // Housekeeping Entrypoints
    |   SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateMetadata                  of updateMetadataType
    |   UpdateConfig                    of aggregatorFactoryUpdateConfigParamsType
    |   UpdateWhitelistContracts        of updateWhitelistContractsType
    |   UpdateGeneralContracts          of updateGeneralContractsType
    |   MistakenTransfer                of transferActionType

        // Pause / Break Glass Entrypoints
    |   PauseAll                        of (unit)
    |   UnpauseAll                      of (unit)
    |   TogglePauseEntrypoint           of aggregatorFactoryTogglePauseEntrypointType

        // Aggregator Factory Entrypoints
    |   CreateAggregator                of createAggregatorParamsType
    |   TrackAggregator                 of (address)
    |   UntrackAggregator               of (address)

        // Aggregator Entrypoints
    |   DistributeRewardMvrk             of distributeRewardMvrkType
    |   DistributeRewardStakedMvn       of distributeRewardStakedMvnType

        // Lambda Entrypoints
    |   SetLambda                       of setLambdaType
    |   SetProductLambda                of setLambdaType
    

const noOperations : list (operation) = nil;
type return is list (operation) * aggregatorFactoryStorageType;

// aggregator factory contract methods lambdas
type aggregatorFactoryUnpackLambdaFunctionType is (aggregatorFactoryLambdaActionType * aggregatorFactoryStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// AggregatorFactory Helpers:
#include "../partials/contractHelpers/aggregatorFactoryHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// AggregatorFactory Views:
#include "../partials/contractViews/aggregatorFactoryViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// AggregatorFactory Lambdas:
#include "../partials/contractLambdas/aggregatorFactoryLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// AggregatorFactory Entrypoints:
#include "../partials/contractEntrypoints/aggregatorFactoryEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : aggregatorFactoryAction; const s : aggregatorFactoryStorageType) : return is
block{

    verifyNoAmountSent(Unit); // entrypoints should not receive any mav amount  

} with (
    case action of [

            // Housekeeping Entrypoints
        |   SetAdmin (parameters)                         -> setAdmin(parameters, s)
        |   SetGovernance (parameters)                    -> setGovernance(parameters, s)
        |   UpdateMetadata (parameters)                   -> updateMetadata(parameters, s)
        |   UpdateConfig (parameters)                     -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts (parameters)         -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts (parameters)           -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer (parameters)                 -> mistakenTransfer(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll (_parameters)                        -> pauseAll(s)
        |   UnpauseAll (_parameters)                      -> unpauseAll(s)
        |   TogglePauseEntrypoint (parameters)            -> togglePauseEntrypoint(parameters, s)

            // Aggregator Factory Entrypoints  
        |   CreateAggregator (parameters)                 -> createAggregator(parameters, s)
        |   TrackAggregator (parameters)                  -> trackAggregator(parameters, s)
        |   UntrackAggregator (parameters)                -> untrackAggregator(parameters, s)

            // Aggregator Entrypoints
        |   DistributeRewardMvrk (parameters)              -> distributeRewardMvrk(parameters, s)
        |   DistributeRewardStakedMvn (parameters)        -> distributeRewardStakedMvn(parameters, s)

            // Lambda Entrypoints
        |   SetLambda (parameters)                        -> setLambda(parameters, s)
        |   SetProductLambda (parameters)                 -> setProductLambda(parameters, s)
    ]
)
