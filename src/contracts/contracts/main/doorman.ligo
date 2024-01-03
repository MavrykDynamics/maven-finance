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

// MvnToken types for transfer
#include "../partials/contractTypes/mvnTokenTypes.ligo"

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
    |   TogglePauseEntrypoint       of doormanTogglePauseEntrypointType

        // Doorman Entrypoints
    |   StakeMvn                    of (nat)
    |   UnstakeMvn                  of (nat)
    |   Exit                        of (unit)
    |   Compound                    of set(address)
    |   FarmClaim                   of farmClaimType

        // Vault Entrypoints - callable only by Lending Controller
    |   OnVaultDepositStake         of onVaultDepositStakeType
    |   OnVaultWithdrawStake        of onVaultWithdrawStakeType
    |   OnVaultLiquidateStake       of onVaultLiquidateStakeType

        // Lambda Entrypoints
    |   SetLambda                   of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * doormanStorageType

// doorman contract methods lambdas
type doormanUnpackLambdaFunctionType is (doormanLambdaActionType * doormanStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// Doorman Helpers:
#include "../partials/contractHelpers/doormanHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// Doorman Views:
#include "../partials/contractViews/doormanViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// Doorman Lambdas:
#include "../partials/contractLambdas/doormanLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// Doorman Entrypoints:
#include "../partials/contractEntrypoints/doormanEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : doormanAction; const s : doormanStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoints should not receive any tez amount  

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
        |   StakeMvn(parameters)                     -> stake(parameters, s)  
        |   UnstakeMvn(parameters)                   -> unstakeMvn(parameters, s)
        |   Exit(_parameters)                     -> exit(s)
        |   Compound(parameters)                  -> compound(parameters, s)
        |   FarmClaim(parameters)                 -> farmClaim(parameters, s)

            // Vault Entrypoints - callable only by Lending Controller
        |   OnVaultDepositStake(parameters)       -> onVaultDepositStake(parameters, s)
        |   OnVaultWithdrawStake(parameters)      -> onVaultWithdrawStake(parameters, s)
        |   OnVaultLiquidateStake(parameters)     -> onVaultLiquidateStake(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                 -> setLambda(parameters, s)
    ]
    
)
