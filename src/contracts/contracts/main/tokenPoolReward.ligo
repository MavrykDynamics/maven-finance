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

// Token Pool Types
#include "../partials/contractTypes/tokenPoolRewardTypes.ligo"

// Token Pool Reward Types
#include "../partials/contractTypes/tokenPoolRewardTypes.ligo"

// ------------------------------------------------------------------------------


type tokenPoolRewardAction is 

    |   Default                         of unit

        // Housekeeping Entrypoints    
    |   SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateMetadata                  of updateMetadataType
    |   UpdateWhitelistContracts        of updateWhitelistContractsType
    |   UpdateGeneralContracts          of updateGeneralContractsType
    |   UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsType
    |   MistakenTransfer                of transferActionType

        // BreakGlass Entrypoints   
    |   PauseAll                        of (unit)
    |   UnpauseAll                      of (unit)
    |   TogglePauseEntrypoint           of tokenPoolRewardTogglePauseEntrypointType

        // Rewards Entrypoints
    |   OnClaimRewards                  of transferActionType

        // Lambda Entrypoints
    |   SetLambda                       of setLambdaType
    
const noOperations : list (operation) = nil;
type return is list (operation) * tokenPoolRewardStorageType


// tokenPoolReward contract methods lambdas
type tokenPoolRewardUnpackLambdaFunctionType is (tokenPoolRewardLambdaActionType * tokenPoolRewardStorageType) -> return



// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const zeroAddress           : address  = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);
const fixedPointAccuracy    : nat      = 1_000_000_000_000_000_000_000_000n // 10^24 - // for use in division
const constFee              : nat      = 9995n;  // 0.05% fee
const constFeeDenom         : nat      = 10000n;

// ------------------------------------------------------------------------------
//
// Constants End
//
// ------------------------------------------------------------------------------




// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// helper functions - conversions
function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;
function ceildiv(const numerator : nat; const denominator : nat) is abs( (- numerator) / (int (denominator)) );



// Allowed Senders : Admin, Governance Contract
function checkSenderIsAllowed(const s : tokenPoolRewardStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders: Admin
function checkSenderIsAdmin(var s : tokenPoolRewardStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Allowed Senders: Lending Controller Contract
function checkSenderIsLendingControllerContract(var s : tokenPoolRewardStorageType) : unit is
block{

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress: address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    if (Tezos.get_sender() = lendingControllerAddress) then skip
    else failwith(error_ONLY_LENDING_CONTROLLER_CONTRACT_ALLOWED);

} with unit



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if Tezos.get_amount() =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
    else unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check that the %onClaimRewards entrypoint is not paused
function checkOnClaimRewardsIsNotPaused(var s : tokenPoolRewardStorageType) : unit is
    if s.breakGlassConfig.onClaimRewardsIsPaused then failwith(error_ON_CLAIM_REWARDS_ENTRYPOINT_IN_TOKEN_POOL_REWARD_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(tokenPoolRewardUnpackLambdaFunctionType)) of [
            Some(f) -> f(tokenPoolRewardLambdaAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Lambda Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Lambda Helpers Begin
//
// ------------------------------------------------------------------------------

// Token Pool Reward Lambdas:
#include "../partials/contractLambdas/tokenPoolReward/tokenPoolRewardLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Helpers End
//
// ------------------------------------------------------------------------------




// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------




// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : tokenPoolRewardStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : tokenPoolRewardStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : tokenPoolRewardStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

} with response




(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : tokenPoolRewardStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

} with response



// (* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : tokenPoolRewardStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

} with response



// (* updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : tokenPoolRewardStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: tokenPoolRewardStorageType): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s : tokenPoolRewardStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

} with response



// (* unpauseAll entrypoint *)
function unpauseAll(var s : tokenPoolRewardStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

} with response



// (*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : tokenPoolRewardTogglePauseEntrypointType; const s : tokenPoolRewardStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Rewards Entrypoints Begin
// ------------------------------------------------------------------------------

(* onClaimRewards entrypoint *)
function onClaimRewards(const onClaimRewardsParams : transferActionType; var s : tokenPoolRewardStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaOnClaimRewards"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaOnClaimRewards(onClaimRewardsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Rewards Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : tokenPoolRewardStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;

    // set lambda in lambdaLedger - allow override of lambdas
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : tokenPoolRewardAction; const s : tokenPoolRewardStorageType) : return is 

    case action of [

        |   Default(_params)                              -> ((nil : list(operation)), s)
        
            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                        -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                   -> setGovernance(parameters, s) 
        |   UpdateMetadata(parameters)                  -> updateMetadata(parameters, s)
        |   UpdateWhitelistContracts(parameters)        -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)          -> updateGeneralContracts(parameters, s)
        |   UpdateWhitelistTokenContracts(parameters)   -> updateWhitelistTokenContracts(parameters, s)
        |   MistakenTransfer(parameters)                -> mistakenTransfer(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll(_parameters)                       -> pauseAll(s)
        |   UnpauseAll(_parameters)                     -> unpauseAll(s)
        |   TogglePauseEntrypoint(parameters)           -> togglePauseEntrypoint(parameters, s)

            // Rewards Entrypoints
        |   OnClaimRewards(parameters)                  -> onClaimRewards(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                       -> setLambda(parameters, s)
           
    ]