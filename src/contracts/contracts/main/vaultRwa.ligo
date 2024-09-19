// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Methods and Types
// ------------------------------------------------------------------------------

// Shared Methods
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Methods
#include "../partials/shared/transferHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Vault RWA Types
#include "../partials/contractTypes/vaultRwaTypes.ligo"

// Vault Factory Types
#include "../partials/contractTypes/vaultFactoryTypes.ligo"

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// Lending Controller Types
#include "../partials/contractTypes/lendingControllerTypes.ligo"

// ------------------------------------------------------------------------------

type vaultRwaActionType is 

    |   Default                         of unit

        // Vault Entrypoints
    |   InitVaultAction                 of initVaultActionType

const noOperations : list (operation) = nil;
type return is list (operation) * vaultRwaStorageType

// vault contract methods lambdas
type vaultUnpackLambdaFunctionType is (vaultLambdaActionType * vaultRwaStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// Vault Helpers:
#include "../partials/contractHelpers/vaultHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// Vault Views:
#include "../partials/contractViews/vaultViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// Vault Lambdas :
#include "../partials/contractLambdas/vaultLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// Vault Entrypoints:
#include "../partials/contractEntrypoints/vaultEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const vaultAction : vaultRwaActionType; const s : vaultRwaStorageType) : return is 

    case vaultAction of [

        |   Default(_params)                             -> default(s)
        
            // Vault Entrypoints 
        |   InitVaultAction(parameters)                  -> initVaultAction(parameters, s)

    ]