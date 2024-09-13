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

// Vault Types
#include "../partials/contractTypes/vaultTypes.ligo"

// VaultFactory Types
#include "../partials/contractTypes/vaultFactoryTypes.ligo"

// LendingController Types
#include "../partials/contractTypes/lendingControllerTypes.ligo"

// KYC Temp Types
#include "../partials/contractTypes/kycTempTypes.ligo"

// ------------------------------------------------------------------------------

// helper function to create vault 
type createVaultFuncType is (option(key_hash) * mav * vaultStorageType) -> (operation * address)
const createVaultFunc : createVaultFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/vault.mv"
        ;
          PAIR } |}
: createVaultFuncType)];

type vaultFactoryAction is

        // Housekeeping Entrypoints
        SetAdmin                    of (address)
    |   SetGovernance               of (address)
    |   UpdateMetadata              of updateMetadataType
    |   UpdateConfig                of vaultFactoryUpdateConfigParamsType
    |   UpdateWhitelistContracts    of updateWhitelistContractsType
    |   UpdateGeneralContracts      of updateGeneralContractsType
    |   MistakenTransfer            of transferActionType

        // Pause / Break Glass Entrypoints
    |   PauseAll                    of (unit)
    |   UnpauseAll                  of (unit)
    |   TogglePauseEntrypoint       of vaultFactoryTogglePauseEntrypointType

        // Vault Factory Entrypoints
    |   CreateVault                  of createVaultType
    
        // Lambda Entrypoints
    |   SetLambda                   of setLambdaType
    |   SetProductLambda            of setLambdaType

type return is list (operation) * vaultFactoryStorageType
const noOperations: list (operation) = nil;

// vault factory contract methods lambdas
type vaultFactoryUnpackLambdaFunctionType is (vaultFactoryLambdaActionType * vaultFactoryStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// Vault Factory Helpers:
#include "../partials/contractHelpers/vaultFactoryHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// Vault Factory Views:
#include "../partials/contractViews/vaultFactoryViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// Vault Factory Lambdas:
#include "../partials/contractLambdas/vaultFactoryLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// Vault Factory Entrypoints:
#include "../partials/contractEntrypoints/vaultFactoryEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : vaultFactoryAction; var s : vaultFactoryStorageType) : return is

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

            // Vault Factory Entrypoints
        |   CreateVault (params)                    -> createVault(params, s)

            // Lambda Entrypoints
        |   SetLambda (parameters)                  -> setLambda(parameters, s)
        |   SetProductLambda (parameters)           -> setProductLambda(parameters, s)
    ]

