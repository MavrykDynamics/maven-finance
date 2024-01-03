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

// EmergencyGovernance types
#include "../partials/contractTypes/emergencyGovernanceTypes.ligo"

// ------------------------------------------------------------------------------

type emergencyGovernanceAction is 

        // Housekeeping Entrypoints
        SetAdmin                  of (address)
    |   SetGovernance             of (address)
    |   UpdateMetadata            of updateMetadataType
    |   UpdateConfig              of emergencyUpdateConfigParamsType    
    |   UpdateWhitelistContracts  of updateWhitelistContractsType
    |   UpdateGeneralContracts    of updateGeneralContractsType
    |   MistakenTransfer          of transferActionType

        // Emergency Governance Entrypoints
    |   TriggerEmergencyControl   of triggerEmergencyControlType
    |   VoteForEmergencyControl   of (unit)

        // Lambda Entrypoints
    |   SetLambda                 of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * emergencyGovernanceStorageType

// emergencyGovernance contract methods lambdas
type emergencyGovernanceUnpackLambdaFunctionType is (emergencyGovernanceLambdaActionType * emergencyGovernanceStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// EmergencyGovernance Helpers:
#include "../partials/contractHelpers/emergencyGovernanceHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// EmergencyGovernance Views:
#include "../partials/contractViews/emergencyGovernanceViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// EmergencyGovernance Lambdas:
#include "../partials/contractLambdas/emergencyGovernanceLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// EmergencyGovernance Entrypoints:
#include "../partials/contractEntrypoints/emergencyGovernanceEntrypoints.ligo"

// ------------------------------------------------------------------------------


function main (const action : emergencyGovernanceAction; const s : emergencyGovernanceStorageType) : return is 

    case action of [

            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                  -> setAdmin(parameters, s)
        |   SetGovernance(parameters)             -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)            -> updateMetadata(parameters, s)
        |   UpdateConfig(parameters)              -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)

            // Emergency Governance Entrypoints
        |   TriggerEmergencyControl(parameters)   -> triggerEmergencyControl(parameters, s)
        |   VoteForEmergencyControl(_parameters)  -> voteForEmergencyControl(s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                 -> setLambda(parameters, s)
    ]
