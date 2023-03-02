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

// Vault Types
#include "../partials/contractTypes/vaultTypes.ligo"

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// Lending Controller Types
#include "../partials/contractTypes/lendingControllerTypes.ligo"

// ------------------------------------------------------------------------------

type vaultActionType is 

    |   Default                         of unit

        // Housekeeping Entrypoints
    |   SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateMetadata                  of updateMetadataType
    
        // Vault Entrypoints
    |   DelegateTezToBaker              of delegateTezToBakerType
    |   DelegateMvkToSatellite          of satelliteAddressType
    |   Deposit                         of depositType 
    |   Withdraw                        of withdrawType
    |   OnLiquidate                     of onLiquidateType
    |   UpdateDepositor                 of updateDepositorType
    |   UpdateTokenOperators            of updateTokenOperatorsType
  
        // Lambda Entrypoints
    |   SetLambda                       of setLambdaType

const noOperations : list (operation) = nil;
type return is list (operation) * vaultStorageType

// vault contract methods lambdas
type vaultUnpackLambdaFunctionType is (vaultLambdaActionType * vaultStorageType) -> return


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
function main (const vaultAction : vaultActionType; const s : vaultStorageType) : return is 

    case vaultAction of [

        |   Default(_params)                             -> default(s)

            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                         -> setAdmin(parameters, s) 
        |   SetGovernance(parameters)                    -> setGovernance(parameters, s) 
        |   UpdateMetadata(parameters)                   -> updateMetadata(parameters, s)
        
            // Vault Entrypoints 
        |   DelegateTezToBaker(parameters)               -> delegateTezToBaker(parameters, s)
        |   DelegateMvkToSatellite(parameters)           -> delegateMvkToSatellite(parameters, s)
        |   Deposit(parameters)                          -> deposit(parameters, s)
        |   Withdraw(parameters)                         -> withdraw(parameters, s)
        |   OnLiquidate(parameters)                      -> onLiquidate(parameters, s)
        |   UpdateDepositor(parameters)                  -> updateDepositor(parameters, s)
        |   UpdateTokenOperators(parameters)             -> updateTokenOperators(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                        -> setLambda(parameters, s)    

    ]