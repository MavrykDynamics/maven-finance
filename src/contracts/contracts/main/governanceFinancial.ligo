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

// Votes Helpers
#include "../partials/shared/voteHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// MvkToken Types
#include "../partials/contractTypes/mvkTokenTypes.ligo"

// Treasury Type for mint and transfers
#include "../partials/contractTypes/treasuryTypes.ligo"

// Council Type for financial requests
#include "../partials/contractTypes/councilTypes.ligo"

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// Governance Types
#include "../partials/contractTypes/governanceTypes.ligo"

// Governance Financial Type
#include "../partials/contractTypes/governanceFinancialTypes.ligo"

// ------------------------------------------------------------------------------

type governanceFinancialAction is 

        // Housekeeping Entrypoints
    |   SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateMetadata                  of updateMetadataType
    |   UpdateConfig                    of governanceFinancialUpdateConfigParamsType
    |   UpdateWhitelistContracts        of updateWhitelistContractsType
    |   UpdateGeneralContracts          of updateGeneralContractsType    
    |   UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsType
    |   MistakenTransfer                of transferActionType

        // Financial Governance Entrypoints
    |   RequestTokens                   of councilActionRequestTokensType
    |   RequestMint                     of councilActionRequestMintType
    |   SetContractBaker                of councilActionSetContractBakerType
    |   DropFinancialRequest            of (nat)
    |   VoteForRequest                  of voteForRequestType

        // Lambda Entrypoints
    |   SetLambda                       of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * governanceFinancialStorageType

// governance contract methods lambdas
type governanceUnpackLambdaFunctionType is (governanceFinancialLambdaActionType * governanceFinancialStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// GovernanceFinancial Helpers:
#include "../partials/contractHelpers/governanceFinancialHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// GovernanceFinancial Views:
#include "../partials/contractViews/governanceFinancialViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// GovernanceFinancial Contract Lambdas :
#include "../partials/contractLambdas/governanceFinancialLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// GovernanceFinancial Entrypoints:
#include "../partials/contractEntrypoints/governanceFinancialEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : governanceFinancialAction; const s : governanceFinancialStorageType) : return is 

    case action of [
            
            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                        -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                   -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)                  -> updateMetadata(parameters, s)
        |   UpdateConfig(parameters)                    -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)        -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)          -> updateGeneralContracts(parameters, s)        
        |   UpdateWhitelistTokenContracts(parameters)   -> updateWhitelistTokenContracts(parameters, s)
        |   MistakenTransfer(parameters)                -> mistakenTransfer(parameters, s)

            // Financial Governance Entrypoints
        |   RequestTokens(parameters)                   -> requestTokens(parameters, s)
        |   RequestMint(parameters)                     -> requestMint(parameters, s)
        |   SetContractBaker(parameters)                -> setContractBaker(parameters, s)
        |   DropFinancialRequest(parameters)            -> dropFinancialRequest(parameters, s)
        |   VoteForRequest(parameters)                  -> voteForRequest(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                       -> setLambda(parameters, s)

    ]
