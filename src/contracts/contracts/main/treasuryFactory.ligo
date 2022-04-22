// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Treasury types
#include "../partials/types/mvkTokenTypes.ligo"

// Treasury types
#include "../partials/types/treasuryTypes.ligo"

// Treasury factory types
#include "../partials/types/treasuryFactoryTypes.ligo"

// ------------------------------------------------------------------------------

type treasuryFactoryAction is

        // Housekeeping Entrypoints
        SetAdmin                            of (address)
    |   UpdateMetadata                      of updateMetadataType
    |   UpdateWhitelistContracts            of updateWhitelistContractsParams
    |   UpdateGeneralContracts              of updateGeneralContractsParams
    |   UpdateWhitelistTokenContracts       of updateWhitelistTokenContractsParams

        // Pause / Break Glass Entrypoints
    |   PauseAll                            of (unit)
    |   UnpauseAll                          of (unit)
    |   TogglePauseCreateTreasury           of (unit)
    |   TogglePauseTrackTreasury            of (unit)
    |   TogglePauseUntrackTreasury          of (unit)

        // Treasury Factory Entrypoints
    |   CreateTreasury                      of string
    |   TrackTreasury                       of address
    |   UntrackTreasury                     of address

        // Lambda Entrypoints
    |   SetLambda                           of setLambdaType


type return is list (operation) * treasuryFactoryStorage
const noOperations: list (operation) = nil;

// treasuryFactory contract methods lambdas
type treasuryFactoryUnpackLambdaFunctionType is (treasuryFactoryLambdaActionType * treasuryFactoryStorage) -> return



// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                                             = 0n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                                      = 1n;

[@inline] const error_CREATE_TREASURY_ENTRYPOINT_IS_PAUSED                                   = 2n;
[@inline] const error_TRACK_TREASURY_ENTRYPOINT_IS_PAUSED                                    = 3n;
[@inline] const error_UNTRACK_TREASURY_ENTRYPOINT_NOT_FOUND                                  = 4n;

[@inline] const error_LAMBDA_NOT_FOUND                                                       = 5n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                                = 6n;

// ------------------------------------------------------------------------------
//
// Error Codes End
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

function checkSenderIsAdmin(const s: treasuryFactoryStorage): unit is
  if Tezos.sender =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
  else unit



function checkNoAmount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
  else unit



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"



// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"



// Whitelist Token Contracts: checkInWhitelistTokenContracts, updateWhitelistTokenContracts
#include "../partials/whitelistTokenContractsMethod.ligo"

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

function checkCreateTreasuryIsNotPaused(var s : treasuryFactoryStorage) : unit is
    if s.breakGlassConfig.createTreasuryIsPaused then failwith(error_CREATE_TREASURY_ENTRYPOINT_IS_PAUSED)
    else unit;



function checkTrackTreasuryIsNotPaused(var s : treasuryFactoryStorage) : unit is
    if s.breakGlassConfig.trackTreasuryIsPaused then failwith(error_TRACK_TREASURY_ENTRYPOINT_IS_PAUSED)
    else unit;



function checkUntrackTreasuryIsNotPaused(var s : treasuryFactoryStorage) : unit is
    if s.breakGlassConfig.untrackTreasuryIsPaused then failwith(error_UNTRACK_TREASURY_ENTRYPOINT_NOT_FOUND)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorage) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(treasuryFactoryUnpackLambdaFunctionType)) of [
        Some(f) -> f(treasuryFactoryLambdaAction, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
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
// Lambda Methods Begin
//
// ------------------------------------------------------------------------------

// Treasury Factory Lambdas:
#include "../partials/contractLambdas/treasuryFactory/treasuryFactoryLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Methods End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: checkTreasuryExists *)
[@view] function checkTreasuryExists (const treasuryContract: address; const s: treasuryFactoryStorage): bool is 
    Set.mem(treasuryContract, s.trackedTreasuries)

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

(* setAdmin entrypoint *)
function setAdmin(const newAdminAddress: address; var s: treasuryFactoryStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : treasuryFactoryStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: treasuryFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: treasuryFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s: treasuryFactoryStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s: treasuryFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s: treasuryFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* togglePauseCreateTreasury entrypoint *)
function togglePauseCreateTreasury(var s: treasuryFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseCreateTreasury"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaTogglePauseCreateTreasury(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* togglePauseUntrackTreasury entrypoint *)
function togglePauseUntrackTreasury(var s: treasuryFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUntrackTreasury"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaToggleUntrackTreasury(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* togglePauseTrackTreasury entrypoint *)
function togglePauseTrackTreasury(var s: treasuryFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseTrackTreasury"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaToggleTrackTreasury(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Treasury Factory Entrypoints Begin
// ------------------------------------------------------------------------------

(* createTreasury entrypoint *)
function createTreasury(const treasuryName: string; var s: treasuryFactoryStorage): return is 
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCreateTreasury"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaCreateTreasury(treasuryName);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* trackTreasury entrypoint *)
function trackTreasury (const treasuryContract: address; var s: treasuryFactoryStorage): return is 
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTrackTreasury"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaTrackTreasury(treasuryContract);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* untrackTreasury entrypoint *)
function untrackTreasury (const treasuryContract: address; var s: treasuryFactoryStorage): return is 
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUntrackTreasury"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaUntrackTreasury(treasuryContract);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Treasury Factory Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: treasuryFactoryStorage): return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with(noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action: treasuryFactoryAction; var s: treasuryFactoryStorage): return is
  block{
    
    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

  } with(

    case action of [

            // Housekeeping Entrypoints
            SetAdmin (parameters)                       -> setAdmin(parameters, s)
        |   UpdateMetadata (parameters)                 -> updateMetadata(parameters, s)
        |   UpdateWhitelistContracts (parameters)       -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts (parameters)         -> updateGeneralContracts(parameters, s)
        |   UpdateWhitelistTokenContracts (parameters)  -> updateWhitelistTokenContracts(parameters, s)
        
            // Pause / Break Glass Entrypoints
        |   PauseAll (_parameters)                      -> pauseAll(s)
        |   UnpauseAll (_parameters)                    -> unpauseAll(s)
        |   TogglePauseCreateTreasury (_parameters)     -> togglePauseCreateTreasury(s)
        |   TogglePauseTrackTreasury (_parameters)      -> togglePauseTrackTreasury(s)
        |   TogglePauseUntrackTreasury (_parameters)    -> togglePauseUntrackTreasury(s)

            // Treasury Factory Entrypoints
        |   CreateTreasury (params)                     -> createTreasury(params, s)
        |   TrackTreasury (params)                      -> trackTreasury(params, s)
        |   UntrackTreasury (params)                    -> untrackTreasury(params, s)

            // Lambda Entrypoints
        |   SetLambda (params)                          -> setLambda(params, s)
    ]
)