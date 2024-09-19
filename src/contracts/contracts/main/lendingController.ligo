// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Methods and Types
// ------------------------------------------------------------------------------

// Constants
#include "../partials/shared/constants.ligo"

// Shared Methods
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Methods
#include "../partials/shared/transferHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Maven FA2 Token Types 
#include "../partials/contractTypes/mavenFa2TokenTypes.ligo"

// Doorman Types
#include "../partials/contractTypes/doormanTypes.ligo"

// Aggregator Types - for lastCompletedRoundPriceReturnType
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Vault Types 
#include "../partials/contractTypes/vaultTypes.ligo"

// Lending Controller Types
#include "../partials/contractTypes/lendingControllerTypes.ligo"

// ------------------------------------------------------------------------------

type lendingControllerAction is 

    |   Default of unit
        
        // Housekeeping Entrypoints
    |   SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateConfig                    of lendingControllerUpdateConfigActionType

        // Break Glass Entrypoints
    |   PauseAll                        of (unit)
    |   UnpauseAll                      of (unit)
    |   TogglePauseEntrypoint           of lendingControllerTogglePauseEntrypointType

        // Admin Entrypoints
    |   SetLoanToken                    of setLoanTokenActionType
    |   SetCollateralToken              of setCollateralTokenActionType
    |   RegisterVaultCreation           of registerVaultCreationActionType

        // Token Pool Entrypoints
    |   AddLiquidity                    of addLiquidityActionType
    |   RemoveLiquidity                 of removeLiquidityActionType 

        // Vault Entrypoints
    |   CloseVault                      of closeVaultActionType
    |   RegisterDeposit                 of registerDepositActionType
    |   RegisterWithdrawal              of registerWithdrawalActionType
    |   MarkForLiquidation              of markForLiquidationActionType
    |   LiquidateVault                  of liquidateVaultActionType
    // |   LiquidateRwaVault               of liquidateRwaVaultActionType
    |   Borrow                          of borrowActionType
    |   Repay                           of repayActionType

        // Vault Staked Token Entrypoints  
    |   VaultDepositStakedToken         of vaultDepositStakedTokenActionType   
    |   VaultWithdrawStakedToken        of vaultWithdrawStakedTokenActionType   

        // Lambda Entrypoints
    |   SetLambda                       of setLambdaType

const noOperations : list (operation) = nil;
type return is list (operation) * lendingControllerStorageType


// lendingController contract methods lambdas
type lendingControllerUnpackLambdaFunctionType is (lendingControllerLambdaActionType * lendingControllerStorageType) -> return


// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// Lending Controller Views:
#include "../partials/contractViews/lendingControllerViews.ligo"

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// Lending Controller Helpers:
#include "../partials/contractHelpers/lendingControllerHelpers.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// Lending Controller Lambdas :
#include "../partials/contractLambdas/lendingControllerLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// Lending Controller Entrypoints:
#include "../partials/contractEntrypoints/lendingControllerEntrypoints.ligo"

// ------------------------------------------------------------------------------


(* main entrypoint *)
function main (const action : lendingControllerAction; const s : lendingControllerStorageType) : return is 
    case action of [

        |   Default(_params)                              -> ((nil : list(operation)), s)
        
            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                          -> setAdmin(parameters, s) 
        |   SetGovernance(parameters)                     -> setGovernance(parameters, s) 
        |   UpdateConfig(parameters)                      -> updateConfig(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll(_parameters)                         -> pauseAll(s)
        |   UnpauseAll(_parameters)                       -> unpauseAll(s)
        |   TogglePauseEntrypoint(parameters)             -> togglePauseEntrypoint(parameters, s)

            // Admin Entrypoints
        |   SetLoanToken(parameters)                      -> setLoanToken(parameters, s)
        |   SetCollateralToken(parameters)                -> setCollateralToken(parameters, s)
        |   RegisterVaultCreation(parameters)             -> registerVaultCreation(parameters, s)

            // Token Pool Entrypoints
        |   AddLiquidity(parameters)                      -> addLiquidity(parameters, s)
        |   RemoveLiquidity(parameters)                   -> removeLiquidity(parameters, s)
        
            // Vault Entrypoints
        |   CloseVault(parameters)                        -> closeVault(parameters, s)
        |   RegisterDeposit(parameters)                   -> registerDeposit(parameters, s)
        |   RegisterWithdrawal(parameters)                -> registerWithdrawal(parameters, s)
        |   MarkForLiquidation(parameters)                -> markForLiquidation(parameters, s)
        |   LiquidateVault(parameters)                    -> liquidateVault(parameters, s)
        // |   LiquidateRwaVault(parameters)                 -> liquidateRwaVault(parameters, s)
        |   Borrow(parameters)                            -> borrow(parameters, s)
        |   Repay(parameters)                             -> repay(parameters, s)

            // Vault Staked Token Entrypoints   
        |   VaultDepositStakedToken(parameters)           -> vaultDepositStakedToken(parameters, s)
        |   VaultWithdrawStakedToken(parameters)          -> vaultWithdrawStakedToken(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                         -> setLambda(parameters, s)    

    ]
