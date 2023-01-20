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

// Votes Helpers
#include "../partials/shared/councilActionHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Governance Types
#include "../partials/contractTypes/governanceTypes.ligo"

// BreakGlass Types
#include "../partials/contractTypes/breakGlassTypes.ligo"

// ------------------------------------------------------------------------------

type breakGlassAction is

        // Break Glass
    |   BreakGlass                    of (unit)

        // Housekeeping Entrypoints - Glass Broken Not Required
    |   SetAdmin                      of (address)
    |   SetGovernance                 of (address)
    |   UpdateMetadata                of updateMetadataType
    |   UpdateConfig                  of breakGlassUpdateConfigParamsType    
    |   UpdateWhitelistContracts      of updateWhitelistContractsType
    |   UpdateGeneralContracts        of updateGeneralContractsType
    |   MistakenTransfer              of transferActionType
    |   UpdateCouncilMemberInfo       of councilMemberInfoType
    
        // Internal Control of Council Members
    |   AddCouncilMember              of councilActionAddMemberType
    |   RemoveCouncilMember           of address
    |   ChangeCouncilMember           of councilActionChangeMemberType
    
        // Glass Broken Required
    |   PropagateBreakGlass           of (unit)
    |   SetSingleContractAdmin        of setContractAdminType
    |   SetAllContractsAdmin          of (address)
    |   PauseAllEntrypoints           of (unit)
    |   UnpauseAllEntrypoints         of (unit)
    |   RemoveBreakGlassControl       of (unit)

        // Council Signing of Actions
    |   FlushAction                   of actionIdType
    |   SignAction                    of actionIdType

        // Lambda Entrypoints
    |   ExecuteGovernanceAction       of (bytes)
    |   DataPackingHelper             of breakGlassLambdaActionType
    |   SetLambda                     of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * breakGlassStorageType

// break glass contract methods lambdas
type breakGlassUnpackLambdaFunctionType is (breakGlassLambdaActionType * breakGlassStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// BreakGlass Helpers:
#include "../partials/contractHelpers/breakGlassHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// BreakGlass Views:
#include "../partials/contractViews/breakGlassViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// BreakGlass Lambdas:
#include "../partials/contractLambdas/breakGlassLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// BreakGlass Entrypoints:
#include "../partials/contractEntrypoints/breakGlassEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : breakGlassAction; const s : breakGlassStorageType) : return is 
block {

    verifyNoAmountSent(Unit); // entrypoints should not receive any tez amount  

} with(

    case action of [
        
            // Break Glass
        |   BreakGlass(_parameters)               -> breakGlass(s)
        
            // Housekeeping Entrypoints - Glass Broken Not Required
        |   SetAdmin(parameters)                  -> setAdmin(parameters, s)
        |   SetGovernance(parameters)             -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)            -> updateMetadata(parameters, s)  
        |   UpdateConfig(parameters)              -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)
        |   UpdateCouncilMemberInfo(parameters)   -> updateCouncilMemberInfo(parameters, s)

            // Break Glass Council Actions - Internal Control of Council Members
        |   AddCouncilMember(parameters)          -> addCouncilMember(parameters, s)
        |   RemoveCouncilMember(parameters)       -> removeCouncilMember(parameters, s)
        |   ChangeCouncilMember(parameters)       -> changeCouncilMember(parameters, s)
        
            // Glass Broken Required
        |   PropagateBreakGlass(_parameters)      -> propagateBreakGlass(s)
        |   SetSingleContractAdmin(parameters)    -> setSingleContractAdmin(parameters, s)
        |   SetAllContractsAdmin(parameters)      -> setAllContractsAdmin(parameters, s)
        |   PauseAllEntrypoints(_parameters)      -> pauseAllEntrypoints(s)
        |   UnpauseAllEntrypoints(_parameters)    -> unpauseAllEntrypoints(s)
        |   RemoveBreakGlassControl(_parameters)  -> removeBreakGlassControl(s)

            // Council Signing of Actions
        |   FlushAction(parameters)               -> flushAction(parameters, s)
        |   SignAction(parameters)                -> signAction(parameters, s)

            // Lambda Entrypoints
        |   ExecuteGovernanceAction(parameters)   -> executeGovernanceAction(parameters, s)
        |   DataPackingHelper(parameters)         -> dataPackingHelper(parameters, s)
        |   SetLambda(parameters)                 -> setLambda(parameters, s)
    ]
)
