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

// Permission Helpers
#include "../partials/shared/permissionHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// MVK Token Type
#include "../partials/contractTypes/mvkTokenTypes.ligo"

// Treasury Type
#include "../partials/contractTypes/treasuryTypes.ligo"

// Governance Type
#include "../partials/contractTypes/governanceTypes.ligo"

// ------------------------------------------------------------------------------

type delegationAction is 

        // Housekeeping Entrypoints
    |   SetAdmin                          of (address)
    |   SetGovernance                     of (address)
    |   UpdateMetadata                    of updateMetadataType
    |   UpdateConfig                      of delegationUpdateConfigParamsType
    |   UpdateWhitelistContracts          of updateWhitelistContractsType
    |   UpdateGeneralContracts            of updateGeneralContractsType
    |   MistakenTransfer                  of transferActionType

        // Pause / Break Glass Entrypoints
    |   PauseAll                          of (unit)
    |   UnpauseAll                        of (unit)
    |   TogglePauseEntrypoint             of delegationTogglePauseEntrypointType

        // Delegation Entrypoints
    |   DelegateToSatellite               of delegateToSatelliteType    
    |   UndelegateFromSatellite           of (address)
    
        // Satellite Entrypoints
    |   RegisterAsSatellite               of registerAsSatelliteParamsType
    |   UnregisterAsSatellite             of (address)
    |   UpdateSatelliteRecord             of updateSatelliteRecordType
    |   DistributeReward                  of distributeRewardStakedMvkType
    |   TakeSatellitesSnapshot            of takeSatellitesSnapshotType

        // General Entrypoints
    |   OnStakeChange                     of onStakeChangeType
    |   UpdateSatelliteStatus             of updateSatelliteStatusParamsType

        // Lambda Entrypoints
    |   SetLambda                         of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * delegationStorageType

// delegation contract methods lambdas
type delegationUnpackLambdaFunctionType is (delegationLambdaActionType * delegationStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// Delegation Helpers:
#include "../partials/contractHelpers/delegationHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// Delegation Views:
#include "../partials/contractViews/delegationViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// Delegation Lambdas:
#include "../partials/contractLambdas/delegationLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// Delegation Entrypoints:
#include "../partials/contractEntrypoints/delegationEntrypoints.ligo"

// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : delegationAction; const s : delegationStorageType) : return is 
block{

    verifyNoAmountSent(unit); // entrypoints should not receive any mav amount  

} with (case action of [    

            // Housekeeping Entrypoints
            SetAdmin(parameters)                          -> setAdmin(parameters, s) 
        |   SetGovernance(parameters)                     -> setGovernance(parameters, s) 
        |   UpdateMetadata(parameters)                    -> updateMetadata(parameters, s)
        |   UpdateConfig(parameters)                      -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)          -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)            -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer(parameters)                  -> mistakenTransfer(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll(_parameters)                         -> pauseAll(s)
        |   UnpauseAll(_parameters)                       -> unpauseAll(s)
        |   TogglePauseEntrypoint(parameters)             -> togglePauseEntrypoint(parameters, s)
        
            // Delegation Entrypoints
        |   DelegateToSatellite(parameters)               -> delegateToSatellite(parameters, s)
        |   UndelegateFromSatellite(parameters)           -> undelegateFromSatellite(parameters, s)
        
            // Satellite Entrypoints
        |   RegisterAsSatellite(parameters)               -> registerAsSatellite(parameters, s)
        |   UnregisterAsSatellite(parameters)             -> unregisterAsSatellite(parameters, s)
        |   UpdateSatelliteRecord(parameters)             -> updateSatelliteRecord(parameters, s)
        |   DistributeReward(parameters)                  -> distributeReward(parameters, s)
        |   TakeSatellitesSnapshot(parameters)            -> takeSatellitesSnapshot(parameters, s)

            // General Entrypoints
        |   OnStakeChange(parameters)                     -> onStakeChange(parameters, s)
        |   UpdateSatelliteStatus(parameters)             -> updateSatelliteStatus(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                         -> setLambda(parameters, s)    
    ]
)
