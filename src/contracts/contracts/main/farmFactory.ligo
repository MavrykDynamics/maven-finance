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

// Farm Types
#include "../partials/contractTypes/farmTypes.ligo"

// Farm mToken Types
#include "../partials/contractTypes/farmMTokenTypes.ligo"

// FarmFactory Types
#include "../partials/contractTypes/farmFactoryTypes.ligo"

// ------------------------------------------------------------------------------
// Factory Create Model (Farm) Type
// ------------------------------------------------------------------------------

type createFarmFuncType is (option(key_hash) * mav * farmStorageType) -> (operation * address)
const createFarmFunc: createFarmFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/farm.mv"
        ;
          PAIR } |}
: createFarmFuncType)];


type createFarmMTokenFuncType is (option(key_hash) * mav * farmMTokenStorageType) -> (operation * address)
const createFarmMTokenFunc: createFarmMTokenFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/farmMToken.mv"
        ;
          PAIR } |}
: createFarmMTokenFuncType)];

// ------------------------------------------------------------------------------

type farmFactoryAction is

        // Housekeeping Entrypoints
        SetAdmin                    of (address)
    |   SetGovernance               of (address)
    |   UpdateMetadata              of updateMetadataType
    |   UpdateConfig                of farmFactoryUpdateConfigParamsType
    |   UpdateWhitelistContracts    of updateWhitelistContractsType
    |   UpdateGeneralContracts      of updateGeneralContractsType
    |   MistakenTransfer            of transferActionType

        // Pause / Break Glass Entrypoints
    |   PauseAll                    of (unit)
    |   UnpauseAll                  of (unit)
    |   TogglePauseEntrypoint       of farmFactoryTogglePauseEntrypointType

        // Farm Factory Entrypoints
    |   CreateFarm                  of createFarmType
    |   CreateFarmMToken            of createFarmMTokenType
    |   TrackFarm                   of (address)
    |   UntrackFarm                 of (address)

        // Lambda Entrypoints
    |   SetLambda                   of setLambdaType
    |   SetProductLambda            of setFarmLambdaType


type return is list (operation) * farmFactoryStorageType
const noOperations: list (operation) = nil;

// farm factory contract methods lambdas
type farmFactoryUnpackLambdaFunctionType is (farmFactoryLambdaActionType * farmFactoryStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// FarmFactory Helpers:
#include "../partials/contractHelpers/farmFactoryHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// FarmFactory Views:
#include "../partials/contractViews/farmFactoryViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// FarmFactory Lambdas:
#include "../partials/contractLambdas/farmFactoryLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// FarmFactory Entrypoints:
#include "../partials/contractEntrypoints/farmFactoryEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : farmFactoryAction; var s : farmFactoryStorageType) : return is
block{
    
    verifyNoAmountSent(Unit); // entrypoints should not receive any mav amount  

} with (

    case action of [
        
            // Housekeeping Entrypoints
            SetAdmin (parameters)                   -> setAdmin(parameters, s)
        |   SetGovernance (parameters)              -> setGovernance(parameters, s)
        |   UpdateMetadata (parameters)             -> updateMetadata(parameters, s)
        |   UpdateConfig (parameters)               -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts (parameters)   -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts (parameters)     -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer (parameters)           -> mistakenTransfer(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll (_parameters)                  -> pauseAll(s)
        |   UnpauseAll (_parameters)                -> unpauseAll(s)
        |   TogglePauseEntrypoint (parameters)      -> togglePauseEntrypoint(parameters, s)

            // Farm Factory Entrypoints
        |   CreateFarm (params)                     -> createFarm(params, s)
        |   CreateFarmMToken (params)               -> createFarmMToken(params, s)
        |   TrackFarm (params)                      -> trackFarm(params, s)
        |   UntrackFarm (params)                    -> untrackFarm(params, s)

            // Lambda Entrypoints
        |   SetLambda (parameters)                  -> setLambda(parameters, s)
        |   SetProductLambda (parameters)           -> setProductLambda(parameters, s)
    ]
)
