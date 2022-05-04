// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Farm Types
#include "../partials/types/farmTypes.ligo"

// FarmFactory Types
#include "../partials/types/farmFactoryTypes.ligo"

// ------------------------------------------------------------------------------

type createFarmFuncType is (option(key_hash) * tez * farmStorage) -> (operation * address)
const createFarmFunc: createFarmFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/farm.tz"
        ;
          PAIR } |}
: createFarmFuncType)];

type farmFactoryAction is

    // Housekeeping Entrypoints
    SetAdmin                    of (address)
|   SetGovernance               of (address)
|   UpdateMetadata              of updateMetadataType
|   UpdateWhitelistContracts    of updateWhitelistContractsParams
|   UpdateGeneralContracts      of updateGeneralContractsParams
|   UpdateBlocksPerMinute       of (nat)

    // Pause / Break Glass Entrypoints
|   PauseAll                    of (unit)
|   UnpauseAll                  of (unit)
|   TogglePauseCreateFarm       of (unit)
|   TogglePauseTrackFarm        of (unit)
|   TogglePauseUntrackFarm      of (unit)

    // Farm Factory Entrypoints
|   CreateFarm                  of createFarmType
|   TrackFarm                   of (address)
|   UntrackFarm                 of (address)

    // Lambda Entrypoints
|   SetLambda                   of setLambdaType
|   SetProductLambda            of setLambdaType


type return is list (operation) * farmFactoryStorage
const noOperations: list (operation) = nil;

// farm factory contract methods lambdas
type farmFactoryUnpackLambdaFunctionType is (farmFactoryLambdaActionType * farmFactoryStorage) -> return



// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                                             = 0n;
[@inline] const error_ONLY_GOVERNANCE_PROXY_ALLOWED                                                = 1n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED                               = 2n;
[@inline] const error_ONLY_COUNCIL_CONTRACT_ALLOWED                                          = 3n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                                      = 4n;
[@inline] const error_COUNCIL_CONTRACT_NOT_WHITELISTED                                       = 5n;

[@inline] const error_CREATE_FARM_ENTRYPOINT_IS_PAUSED                                       = 6n;
[@inline] const error_TRACK_FARM_ENTRYPOINT_IS_PAUSED                                        = 7n;
[@inline] const error_UNTRACK_FARM_ENTRYPOINT_IS_PAUSED                                      = 8n;

[@inline] const error_LAMBDA_NOT_FOUND                                                       = 9n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                                = 10n;

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

function checkSenderIsAllowed(var s : farmFactoryStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
        else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);
        


function checkSenderIsAdmin(const s: farmFactoryStorage): unit is
  if Tezos.sender =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
  else unit



function checkNoAmount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
  else unit



function checkSenderOrSourceIsCouncil(const s: farmFactoryStorage): unit is
block {

    const councilAddress: address = case s.whitelistContracts["council"] of [
        Some (_address) -> _address
    |   None -> (failwith(error_COUNCIL_CONTRACT_NOT_WHITELISTED): address)
    ];

    if Tezos.source = councilAddress or Tezos.sender = councilAddress then skip
    else failwith(error_ONLY_COUNCIL_CONTRACT_ALLOWED);

} with(unit)



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"



// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

function checkCreateFarmIsNotPaused(var s : farmFactoryStorage) : unit is
    if s.breakGlassConfig.createFarmIsPaused then failwith(error_CREATE_FARM_ENTRYPOINT_IS_PAUSED)
    else unit;



function checkTrackFarmIsNotPaused(var s : farmFactoryStorage) : unit is
    if s.breakGlassConfig.trackFarmIsPaused then failwith(error_TRACK_FARM_ENTRYPOINT_IS_PAUSED)
    else unit;



function checkUntrackFarmIsNotPaused(var s : farmFactoryStorage) : unit is
    if s.breakGlassConfig.untrackFarmIsPaused then failwith(error_UNTRACK_FARM_ENTRYPOINT_IS_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(farmFactoryUnpackLambdaFunctionType)) of [
        Some(f) -> f(farmFactoryLambdaAction, s)
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

// Farm Factory Lambdas:
#include "../partials/contractLambdas/farmFactory/farmFactoryLambdas.ligo"

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

(* View: checkFarmExists *)
[@view] function checkFarmExists (const farmContract: address; const s: farmFactoryStorage): bool is 
    Set.mem(farmContract, s.trackedFarms)

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
function setAdmin(const newAdminAddress: address; var s: farmFactoryStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : farmFactoryStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);

} with response



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : farmFactoryStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: farmFactoryStorage): return is
block {
        
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: farmFactoryStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  UpdateBlocksPerMinute entrypoint *)
function updateBlocksPerMinute(const newBlocksPerMinute: nat; var s: farmFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateBlocksPerMinute"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUpdateBlocksPerMinute(newBlocksPerMinute);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAll entrypoint *)
function pauseAll(var s: farmFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  unpauseAll entrypoint *)
function unpauseAll(var s: farmFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  togglePauseCreateFarm entrypoint *)
function togglePauseCreateFarm(var s: farmFactoryStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseCreateFarm"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaTogglePauseCreateFarm(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  togglePauseUntrackFarm entrypoint *)
function togglePauseUntrackFarm(var s: farmFactoryStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseUntrackFarm"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaTogglePauseUntrackFarm(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  togglePauseTrackFarm entrypoint *)
function togglePauseTrackFarm(var s: farmFactoryStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseTrackFarm"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaTogglePauseTrackFarm(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Factory Entrypoints Begin
// ------------------------------------------------------------------------------

(* createFarm entrypoint *)
function createFarm(const createFarmParams: createFarmType; var s: farmFactoryStorage): return is 
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCreateFarm"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaCreateFarm(createFarmParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(* trackFarm entrypoint *)
function trackFarm (const farmContract: address; var s: farmFactoryStorage): return is 
block{
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTrackFarm"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaTrackFarm(farmContract);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(* untrackFarm entrypoint *)
function untrackFarm (const farmContract: address; var s: farmFactoryStorage): return is 
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUntrackFarm"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUntrackFarm(farmContract);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Farm Factory Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: farmFactoryStorage): return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with(noOperations, s)



(* setProductLambda entrypoint *)
function setProductLambda(const setLambdaParams: setLambdaType; var s: farmFactoryStorage): return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.farmLambdaLedger[lambdaName] := lambdaBytes;

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
function main (const action: farmFactoryAction; var s: farmFactoryStorage): return is
  block{
    
    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

  } with(

    case action of [
        
            // Housekeeping Entrypoints
            SetAdmin (parameters)                   -> setAdmin(parameters, s)
        |   SetGovernance (parameters)              -> setGovernance(parameters, s)
        |   UpdateMetadata (parameters)             -> updateMetadata(parameters, s)
        |   UpdateWhitelistContracts (parameters)   -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts (parameters)     -> updateGeneralContracts(parameters, s)
        |   UpdateBlocksPerMinute (parameters)      -> updateBlocksPerMinute(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll (_parameters)                  -> pauseAll(s)
        |   UnpauseAll (_parameters)                -> unpauseAll(s)
        |   TogglePauseCreateFarm (_parameters)     -> togglePauseCreateFarm(s)
        |   TogglePauseTrackFarm (_parameters)      -> togglePauseTrackFarm(s)
        |   TogglePauseUntrackFarm (_parameters)    -> togglePauseUntrackFarm(s)

            // Farm Factory Entrypoints
        |   CreateFarm (params)                     -> createFarm(params, s)
        |   TrackFarm (params)                      -> trackFarm(params, s)
        |   UntrackFarm (params)                    -> untrackFarm(params, s)

            // Lambda Entrypoints
        |   SetLambda (parameters)                  -> setLambda(parameters, s)
        |   SetProductLambda (parameters)           -> setProductLambda(parameters, s)
    ]
)