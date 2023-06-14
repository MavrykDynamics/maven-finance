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

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Doorman types
#include "../partials/contractTypes/doormanTypes.ligo"

// Farm types
#include "../partials/contractTypes/farmTypes.ligo"

// FarmFactory Types
#include "../partials/contractTypes/farmFactoryTypes.ligo"

// ------------------------------------------------------------------------------

type farmAction is

        // Housekeeping Entrypoints
        SetAdmin                    of (address)
    |   SetGovernance               of (address)
    |   SetName                     of (string)
    |   UpdateMetadata              of updateMetadataType
    |   UpdateConfig                of farmUpdateConfigParamsType
    |   UpdateWhitelistContracts    of updateWhitelistContractsType
    |   UpdateGeneralContracts      of updateGeneralContractsType
    |   MistakenTransfer            of transferActionType

        // Farm Admin Entrypoints
    |   InitFarm                    of initFarmParamsType
    |   CloseFarm                   of (unit)

        // Pause / Break Glass Entrypoints
    |   PauseAll                    of (unit)
    |   UnpauseAll                  of (unit)
    |   TogglePauseEntrypoint       of farmTogglePauseEntrypointType

        // Farm Entrypoints
    |   Deposit                     of nat
    |   Withdraw                    of nat
    |   Claim                       of claimType

        // Lambda Entrypoints
    |   SetLambda                   of setLambdaType


type return is list (operation) * farmStorageType
const noOperations : list (operation) = nil;

// farm contract methods lambdas
type farmUnpackLambdaFunctionType is (farmLambdaActionType * farmStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// Farm Helpers:
#include "../partials/contractHelpers/farmHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// Farm Views:
#include "../partials/contractViews/farmViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// Farm Lambdas:
#include "../partials/contractLambdas/farmLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// Farm Entrypoints:
#include "../partials/contractEntrypoints/farmEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : farmAction; var s: farmStorageType) : return is
block{

    verifyNoAmountSent(Unit); // entrypoints should not receive any tez amount  

} with (

    case action of [

            // Housekeeping Entrypoints
            SetAdmin (parameters)                    -> setAdmin(parameters, s)
        |   SetGovernance (parameters)               -> setGovernance(parameters, s)
        |   SetName (parameters)                     -> setName(parameters, s)
        |   UpdateMetadata (parameters)              -> updateMetadata(parameters, s)
        |   UpdateConfig (parameters)                -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts (parameters)    -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts (parameters)      -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer (parameters)            -> mistakenTransfer(parameters, s)

            // Farm Admin Entrypoints
        |   InitFarm (parameters)                    -> initFarm(parameters, s)
        |   CloseFarm (_parameters)                  -> closeFarm(s)

            // Pause / Break Glass Entrypoints
        |   PauseAll (_parameters)                   -> pauseAll(s)
        |   UnpauseAll (_parameters)                 -> unpauseAll(s)
        |   TogglePauseEntrypoint (parameters)       -> togglePauseEntrypoint(parameters, s)

            // Farm Entrypoints
        |   Deposit (parameters)                     -> deposit(parameters, s)
        |   Withdraw (parameters)                    -> withdraw(parameters, s)
        |   Claim (parameters)                       -> claim(parameters, s)

            // Lambda Entrypoints
        |   SetLambda (parameters)                   -> setLambda(parameters, s)
    ]
)
