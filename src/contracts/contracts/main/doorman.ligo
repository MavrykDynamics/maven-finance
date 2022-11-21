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

// Doorman types
#include "../partials/contractTypes/doormanTypes.ligo"

// MvkToken types for transfer
#include "../partials/contractTypes/mvkTokenTypes.ligo"

// Treasury types for farmClaim
#include "../partials/contractTypes/treasuryTypes.ligo"

// Delegation types for compound
#include "../partials/contractTypes/delegationTypes.ligo"

// ------------------------------------------------------------------------------

type doormanAction is 

        // Housekeeping Entrypoints
        SetAdmin                    of (address)
    |   SetGovernance               of (address)
    |   UpdateMetadata              of updateMetadataType
    |   UpdateConfig                of doormanUpdateConfigParamsType
    |   UpdateWhitelistContracts    of updateWhitelistContractsType
    |   UpdateGeneralContracts      of updateGeneralContractsType
    |   MistakenTransfer            of transferActionType
    |   MigrateFunds                of (address)

        // Pause / Break Glass Entrypoints
    |   PauseAll                    of (unit)
    |   UnpauseAll                  of (unit)
    |   TogglePauseEntrypoint      of doormanTogglePauseEntrypointType

        // Doorman Entrypoints
    |   Stake                       of (nat)
    |   Unstake                     of (nat)
    |   Compound                    of (address)
    |   FarmClaim                   of farmClaimType

        // Lambda Entrypoints
    |   SetLambda                   of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * doormanStorageType

// doorman contract methods lambdas
type doormanUnpackLambdaFunctionType is (doormanLambdaActionType * doormanStorageType) -> return



// ------------------------------------------------------------------------------
// Constants 
// ------------------------------------------------------------------------------

const fixedPointAccuracy : nat = 1_000_000_000_000_000_000_000_000_000_000_000_000n // 10^36

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// Doorman Helpers:
#include "../partials/contractHelpers/doormanHelpers.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// Doorman Lambdas:
#include "../partials/contractLambdas/doorman/doormanLambdas.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// Doorman Views:
#include "../partials/contractViews/doormanViews.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// Doorman Entrypoints:
#include "../partials/contractEntrypoints/doormanEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : doormanAction; const s : doormanStorageType) : return is
block {
    
    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

} with(

    case action of [

            // Housekeeping Entrypoints
            SetAdmin(parameters)                  -> setAdmin(parameters, s)
        |   SetGovernance(parameters)             -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)            -> updateMetadata(parameters, s)
        |   UpdateConfig(parameters)              -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)
        |   MigrateFunds(parameters)              -> migrateFunds(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll(_parameters)                 -> pauseAll(s)
        |   UnpauseAll(_parameters)               -> unpauseAll(s)
        |   TogglePauseEntrypoint(parameters)     -> togglePauseEntrypoint(parameters, s)

            // Doorman Entrypoints
        |   Stake(parameters)                     -> stake(parameters, s)  
        |   Unstake(parameters)                   -> unstake(parameters, s)
        |   Compound(parameters)                  -> compound(parameters, s)
        |   FarmClaim(parameters)                 -> farmClaim(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                 -> setLambda(parameters, s)
    ]
    
)
