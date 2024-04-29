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

// MvnToken types for transfer
#include "../partials/contractTypes/mvnTokenTypes.ligo"

// Vesting types for vesting council actions
#include "../partials/contractTypes/vestingTypes.ligo"

// Treasury types for transfer and mint
#include "../partials/contractTypes/treasuryTypes.ligo"

// Council Types
#include "../partials/contractTypes/councilTypes.ligo"

// Governance financial Types
#include "../partials/contractTypes/governanceFinancialTypes.ligo"

// ------------------------------------------------------------------------------

// Council Main Entrypoint Actions
type councilAction is 

        // Default Entrypoint to Receive Mav
        Default                                     of unit

        // Housekeeping Actions
    |   SetAdmin                                    of address
    |   SetGovernance                               of (address)
    |   UpdateMetadata                              of updateMetadataType
    |   UpdateConfig                                of councilUpdateConfigParamsType
    |   UpdateWhitelistContracts                    of updateWhitelistContractsType
    |   UpdateGeneralContracts                      of updateGeneralContractsType
    |   UpdateCouncilMemberInfo                     of councilMemberInfoType

        // Council Actions for Internal Control
    |   CouncilActionAddMember                      of councilActionAddMemberType
    |   CouncilActionRemoveMember                   of address
    |   CouncilActionChangeMember                   of councilActionChangeMemberType
    |   CouncilActionSetBaker                       of setBakerType

        // Council Actions for Vesting
    |   CouncilActionAddVestee                      of addVesteeType
    |   CouncilActionRemoveVestee                   of address
    |   CouncilActionUpdateVestee                   of updateVesteeType
    |   CouncilActionToggleVesteeLock               of address

        // Council Actions for Financial Governance
    |   CouncilActionTransfer                       of councilActionTransferType
    |   CouncilActionRequestTokens                  of councilActionRequestTokensType
    |   CouncilActionRequestMint                    of councilActionRequestMintType
    |   CouncilActionSetContractBaker               of councilActionSetContractBakerType
    |   CouncilActionDropFinancialReq               of nat

        // Council Signing of Actions
    |   FlushAction                                 of actionIdType
    |   SignAction                                  of actionIdType                

        // Lambda Entrypoints
    |   SetLambda                                   of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * councilStorageType

// council contract methods lambdas
type councilUnpackLambdaFunctionType is (councilLambdaActionType * councilStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// Council Helpers:
#include "../partials/contractHelpers/councilHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// Council Views:
#include "../partials/contractViews/councilViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// Council Lambdas:
#include "../partials/contractLambdas/councilLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// Council Entrypoints:
#include "../partials/contractEntrypoints/councilEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : councilAction; const s : councilStorageType) : return is 

    case action of [
      
            // Default Entrypoint to Receive Mav
            Default(_parameters)                          -> ((nil : list(operation)), s)

            // Housekeeping Actions
        |   SetAdmin(parameters)                          -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                     -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)                    -> updateMetadata(parameters, s)  
        |   UpdateConfig(parameters)                      -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)          -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)            -> updateGeneralContracts(parameters, s)
        |   UpdateCouncilMemberInfo(parameters)           -> updateCouncilMemberInfo(parameters, s)
        
            // Council Actions for Internal Control
        |   CouncilActionAddMember(parameters)            -> councilActionAddMember(parameters, s)
        |   CouncilActionRemoveMember(parameters)         -> councilActionRemoveMember(parameters, s)
        |   CouncilActionChangeMember(parameters)         -> councilActionChangeMember(parameters, s)
        |   CouncilActionSetBaker(parameters)             -> councilActionSetBaker(parameters, s)

            // Council Actions for Vesting
        |   CouncilActionAddVestee(parameters)            -> councilActionAddVestee(parameters, s)
        |   CouncilActionRemoveVestee(parameters)         -> councilActionRemoveVestee(parameters, s)
        |   CouncilActionUpdateVestee(parameters)         -> councilActionUpdateVestee(parameters, s)
        |   CouncilActionToggleVesteeLock(parameters)     -> councilActionToggleVesteeLock(parameters, s)
        
            // Council Actions for Financial Governance
        |   CouncilActionTransfer(parameters)             -> councilActionTransfer(parameters, s)
        |   CouncilActionRequestTokens(parameters)        -> councilActionRequestTokens(parameters, s)
        |   CouncilActionRequestMint(parameters)          -> councilActionRequestMint(parameters, s)
        |   CouncilActionSetContractBaker(parameters)     -> councilActionSetContractBaker(parameters, s)
        |   CouncilActionDropFinancialReq(parameters)     -> councilActionDropFinancialRequest(parameters, s)

            // Council Signing of Actions 
        |   FlushAction(parameters)                       -> flushAction(parameters, s)
        |   SignAction(parameters)                        -> signAction(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                         -> setLambda(parameters, s)
    ]
