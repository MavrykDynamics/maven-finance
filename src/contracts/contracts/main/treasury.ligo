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

// MvnToken Types
#include "../partials/contractTypes/mvnTokenTypes.ligo"

// Treasury Types
#include "../partials/contractTypes/treasuryTypes.ligo"

// TreasuryFactory Types
#include "../partials/contractTypes/treasuryFactoryTypes.ligo"

// ------------------------------------------------------------------------------

type treasuryAction is 

    |   Default                        of unit

        // Housekeeping Entrypoints
    |   SetAdmin                       of (address)
    |   SetGovernance                  of (address)
    |   SetBaker                       of option(key_hash)
    |   SetName                        of (string)
    |   UpdateMetadata                 of updateMetadataType
    |   UpdateWhitelistContracts       of updateWhitelistContractsType
    |   UpdateGeneralContracts         of updateGeneralContractsType
    |   UpdateWhitelistTokenContracts  of updateWhitelistTokenContractsType

        // Pause / Break Glass Entrypoints
    |   PauseAll                       of (unit)
    |   UnpauseAll                     of (unit)
    |   TogglePauseEntrypoint          of treasuryTogglePauseEntrypointType

        // Treasury Entrypoints
    |   Transfer                       of transferActionType
    |   MintMvnAndTransfer             of mintMvnAndTransferType

        // Staking Entrypoints
    |   UpdateTokenOperators           of updateTokenOperatorsType
    |   StakeTokens                    of stakeTokensType
    |   UnstakeTokens                  of unstakeTokensType

        // Lambda Entrypoints
    |   SetLambda                      of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * treasuryStorageType

// treasury contract methods lambdas
type treasuryUnpackLambdaFunctionType is (treasuryLambdaActionType * treasuryStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// Treasury Helpers:
#include "../partials/contractHelpers/treasuryHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// Treasury Views:
#include "../partials/contractViews/treasuryViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// Treasury Lambdas :
#include "../partials/contractLambdas/treasuryLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// Treasury Entrypoints:
#include "../partials/contractEntrypoints/treasuryEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : treasuryAction; const s : treasuryStorageType) : return is 
    
    case action of [

        |   Default(_params)                              -> ((nil : list(operation)), s)
        
            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                          -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                     -> setGovernance(parameters, s)
        |   SetBaker(parameters)                          -> setBaker(parameters, s)
        |   SetName(parameters)                           -> setName(parameters, s)
        |   UpdateMetadata(parameters)                    -> updateMetadata(parameters, s)
        |   UpdateWhitelistContracts(parameters)          -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)            -> updateGeneralContracts(parameters, s)
        |   UpdateWhitelistTokenContracts(parameters)     -> updateWhitelistTokenContracts(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll(_parameters)                         -> pauseAll(s)
        |   UnpauseAll(_parameters)                       -> unpauseAll(s)
        |   TogglePauseEntrypoint(parameters)             -> togglePauseEntrypoint(parameters, s)
        
            // Treasury Entrypoints
        |   Transfer(parameters)                          -> transfer(parameters, s)
        |   MintMvnAndTransfer(parameters)                -> mintMvnAndTransfer(parameters, s)

            // Staking Entrypoints
        |   UpdateTokenOperators(parameters)              -> updateTokenOperators(parameters, s)
        |   StakeTokens(parameters)                       -> stakeTokens(parameters, s)
        |   UnstakeTokens(parameters)                     -> unstakeTokens(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                         -> setLambda(parameters, s)
    ]
