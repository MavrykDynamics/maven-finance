// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

//  ------------------------------------------------------------------------------
// Shared Helpers and Types
// ------------------------------------------------------------------------------

// Shared Helpers
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Helpers
#include "../partials/shared/transferHelpers.ligo"

// Common Entrypoints
#include "../partials/shared/commonEntrypoints.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// MvnToken types
#include "../partials/contractTypes/mvnTokenTypes.ligo"

// Treasury types
#include "../partials/contractTypes/treasuryTypes.ligo"

// Treasury factory types
#include "../partials/contractTypes/treasuryFactoryTypes.ligo"

// ------------------------------------------------------------------------------
// Factory Create Model (Treasury) Type
// ------------------------------------------------------------------------------

type createTreasuryFuncType is (option(key_hash) * mav * treasuryStorageType) -> (operation * address)
const createTreasuryFunc: createTreasuryFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/treasury.tz"
        ;
          PAIR } |}
: createTreasuryFuncType)];

// ------------------------------------------------------------------------------

type treasuryFactoryAction is

        // Housekeeping Entrypoints
        SetAdmin                            of (address)
    |   SetGovernance                       of (address)
    |   UpdateMetadata                      of updateMetadataType
    |   UpdateConfig                        of treasuryFactoryUpdateConfigParamsType
    |   UpdateWhitelistContracts            of updateWhitelistContractsType
    |   UpdateGeneralContracts              of updateGeneralContractsType
    |   UpdateWhitelistTokenContracts       of updateWhitelistTokenContractsType
    |   MistakenTransfer                    of transferActionType

        // Pause / Break Glass Entrypoints
    |   PauseAll                            of (unit)
    |   UnpauseAll                          of (unit)
    |   TogglePauseEntrypoint               of treasuryFactoryTogglePauseEntrypointType

        // Treasury Factory Entrypoints
    |   CreateTreasury                      of createTreasuryType
    |   TrackTreasury                       of address
    |   UntrackTreasury                     of address

        // Lambda Entrypoints
    |   SetLambda                           of setLambdaType
    |   SetProductLambda                    of setLambdaType


type return is list (operation) * treasuryFactoryStorageType
const noOperations : list (operation) = nil;

// treasuryFactory contract methods lambdas
type treasuryFactoryUnpackLambdaFunctionType is (treasuryFactoryLambdaActionType * treasuryFactoryStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// TreasuryFactory Helpers:
#include "../partials/contractHelpers/treasuryFactoryHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// TreasuryFactory Views:
#include "../partials/contractViews/treasuryFactoryViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// TreasuryFactory Lambdas :
#include "../partials/contractLambdas/treasuryFactoryLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// TreasuryFactory Entrypoints:
#include "../partials/contractEntrypoints/treasuryFactoryEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : treasuryFactoryAction; var s : treasuryFactoryStorageType) : return is
block{
    
    verifyNoAmountSent(Unit); // entrypoints should not receive any mav amount  

} with(

    case action of [

            // Housekeeping Entrypoints
            SetAdmin (parameters)                       -> setAdmin(parameters, s)
        |   SetGovernance (parameters)                  -> setGovernance(parameters, s)
        |   UpdateMetadata (parameters)                 -> updateMetadata(parameters, s)
        |   UpdateConfig (parameters)                   -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts (parameters)       -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts (parameters)         -> updateGeneralContracts(parameters, s)
        |   UpdateWhitelistTokenContracts (parameters)  -> updateWhitelistTokenContracts(parameters, s)
        |   MistakenTransfer (parameters)               -> mistakenTransfer(parameters, s)
        
            // Pause / Break Glass Entrypoints
        |   PauseAll (_parameters)                      -> pauseAll(s)
        |   UnpauseAll (_parameters)                    -> unpauseAll(s)
        |   TogglePauseEntrypoint (parameters)          -> togglePauseEntrypoint(parameters, s)

            // Treasury Factory Entrypoints
        |   CreateTreasury (params)                     -> createTreasury(params, s)
        |   TrackTreasury (params)                      -> trackTreasury(params, s)
        |   UntrackTreasury (params)                    -> untrackTreasury(params, s)

            // Lambda Entrypoints
        |   SetLambda (params)                          -> setLambda(params, s)
        |   SetProductLambda (params)                   -> setProductLambda(params, s)
    ]
)
