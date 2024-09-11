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

// MvnToken types for transfer
#include "../partials/contractTypes/mvnTokenTypes.ligo"

// Vesting types
#include "../partials/contractTypes/vestingTypes.ligo"

// ------------------------------------------------------------------------------

type vestingAction is 
    
        // Housekeeping Entrypoints
        SetAdmin                      of (address)
    |   SetGovernance                 of (address)
    |   UpdateMetadata                of updateMetadataType
    |   UpdateWhitelistContracts      of updateWhitelistContractsType
    |   UpdateGeneralContracts        of updateGeneralContractsType
    |   MistakenTransfer              of transferActionType
    
        // Internal Vestee Control Entrypoints
    |   AddVestee                     of (addVesteeType)
    |   RemoveVestee                  of (address)
    |   UpdateVestee                  of (updateVesteeType)
    |   ToggleVesteeLock              of (address)

        // Vestee Entrypoints
    |   Claim                         of (unit)

        // Lambda Entrypoints
    |   SetLambda                     of setLambdaType


const noOperations   : list (operation) = nil;
type return is list (operation) * vestingStorageType

// vesting contract methods lambdas
type vestingUnpackLambdaFunctionType is (vestingLambdaActionType * vestingStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// Vesting Helpers:
#include "../partials/contractHelpers/vestingHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// Vesting Views:
#include "../partials/contractViews/vestingViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// Vesting Lambdas :
#include "../partials/contractLambdas/vestingLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// Vesting Entrypoints:
#include "../partials/contractEntrypoints/vestingEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : vestingAction; const s : vestingStorageType) : return is
block{
        
    verifyNoAmountSent(unit); // entrypoints should not receive any mav amount  

} with (case action of [

            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                    -> setAdmin(parameters, s)  
        |   SetGovernance(parameters)               -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)              -> updateMetadata(parameters, s)
        |   UpdateWhitelistContracts(parameters)    -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)      -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer(parameters)            -> mistakenTransfer(parameters, s)

            // Internal Vestee Control Entrypoints
        |   AddVestee(parameters)                   -> addVestee(parameters, s)
        |   RemoveVestee(parameters)                -> removeVestee(parameters, s)
        |   UpdateVestee(parameters)                -> updateVestee(parameters, s)        
        |   ToggleVesteeLock(parameters)            -> toggleVesteeLock(parameters, s)

            // Vestee Entrypoints
        |   Claim(_parameters)                      -> claim(s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                   -> setLambda(parameters, s)
    ]
)
