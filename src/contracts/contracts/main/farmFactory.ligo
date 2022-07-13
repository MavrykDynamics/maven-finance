// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Methods and Types
// ------------------------------------------------------------------------------

// Shared Methods
#include "../partials/shared/sharedMethods.ligo"

// Transfer Methods
#include "../partials/shared/transferMethods.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Farm Types
#include "../partials/contractTypes/farmTypes.ligo"

// FarmFactory Types
#include "../partials/contractTypes/farmFactoryTypes.ligo"

// ------------------------------------------------------------------------------

type createFarmFuncType is (option(key_hash) * tez * farmStorageType) -> (operation * address)
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
    |   UpdateConfig                of farmFactoryUpdateConfigParamsType
    |   UpdateWhitelistContracts    of updateWhitelistContractsType
    |   UpdateGeneralContracts      of updateGeneralContractsType
    |   MistakenTransfer            of transferActionType
    |   UpdateBlocksPerMinute       of (nat)

        // Pause / Break Glass Entrypoints
    |   PauseAll                    of (unit)
    |   UnpauseAll                  of (unit)
    |   TogglePauseEntrypoint       of farmFactoryTogglePauseEntrypointType

        // Farm Factory Entrypoints
    |   CreateFarm                  of createFarmType
    |   TrackFarm                   of (address)
    |   UntrackFarm                 of (address)

        // Lambda Entrypoints
    |   SetLambda                   of setLambdaType
    |   SetProductLambda            of setLambdaType


type return is list (operation) * farmFactoryStorageType
const noOperations: list (operation) = nil;

// farm factory contract methods lambdas
type farmFactoryUnpackLambdaFunctionType is (farmFactoryLambdaActionType * farmFactoryStorageType) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : farmFactoryStorageType) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);
        


// Allowed Senders: Admin
function checkSenderIsAdmin(const s : farmFactoryStorageType) : unit is
    if Tezos.sender =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Allowed Senders: Council Contract
function checkSenderIsCouncil(const s : farmFactoryStorageType) : unit is
block {

    const councilAddress: address = case s.whitelistContracts["council"] of [
            Some (_address) -> _address
        |   None            -> (failwith(error_COUNCIL_CONTRACT_NOT_FOUND) : address)
    ];

    if Tezos.sender = councilAddress then skip
    else failwith(error_ONLY_COUNCIL_CONTRACT_ALLOWED);

} with(unit)



// Allowed Senders: Admin, Governance Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : farmFactoryStorageType) : unit is
block{
    if Tezos.sender = s.admin then skip
    else {

        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "governanceSatellite", s.governanceAddress);
        const governanceSatelliteAddress: address = case generalContractsOptView of [
                Some (_optionContract) -> case _optionContract of [
                        Some (_contract)    -> _contract
                    |   None                -> failwith (error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND)
                ]
            |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
        ];

        if Tezos.sender = governanceSatelliteAddress then skip
        else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
    }
} with unit



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if Tezos.amount =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
    else unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check that the %createFarm entrypoint is not paused
function checkCreateFarmIsNotPaused(var s : farmFactoryStorageType) : unit is
    if s.breakGlassConfig.createFarmIsPaused then failwith(error_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %trackFarm entrypoint is not paused
function checkTrackFarmIsNotPaused(var s : farmFactoryStorageType) : unit is
    if s.breakGlassConfig.trackFarmIsPaused then failwith(error_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %untrackFarm entrypoint is not paused
function checkUntrackFarmIsNotPaused(var s : farmFactoryStorageType) : unit is
    if s.breakGlassConfig.untrackFarmIsPaused then failwith(error_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(farmFactoryUnpackLambdaFunctionType)) of [
            Some(f) -> f(farmFactoryLambdaAction, s)
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

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : farmFactoryStorageType) : address is
    s.admin



(* View: checkFarmExists *)
[@view] function checkFarmExists (const farmContract : address; const s: farmFactoryStorageType) : bool is 
    Set.mem(farmContract, s.trackedFarms)



(* View: get config *)
[@view] function getConfig (const _ : unit; const s : farmFactoryStorageType) : farmFactoryConfigType is 
    s.config



(* View: get break glass config *)
[@view] function getBreakGlassConfig (const _ : unit; const s : farmFactoryStorageType) : farmFactoryBreakGlassConfigType is 
    s.breakGlassConfig



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts (const _ : unit; const s : farmFactoryStorageType) : whitelistContractsType is 
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts (const _ : unit; const s : farmFactoryStorageType) : generalContractsType is 
    s.generalContracts



(* View: get tracked farms *)
[@view] function getTrackedFarms (const _ : unit; const s : farmFactoryStorageType) : set(address) is 
    s.trackedFarms



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : farmFactoryStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : farmFactoryStorageType) : lambdaLedgerType is
    s.lambdaLedger



(* View: get a farm lambda *)
[@view] function farmLambdaOpt(const lambdaName : string; var s : farmFactoryStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.farmLambdaLedger)



(* View: get the farm lambda ledger *)
[@view] function farmLambdaLedger(const _ : unit; var s : farmFactoryStorageType) : lambdaLedgerType is
    s.farmLambdaLedger

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
function setAdmin(const newAdminAddress : address; var s : farmFactoryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : farmFactoryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);

} with response



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : farmFactoryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : farmFactoryUpdateConfigParamsType; var s : farmFactoryStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : farmFactoryStorageType) : return is
block {
        
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : farmFactoryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : farmFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  UpdateBlocksPerMinute entrypoint *)
function updateBlocksPerMinute(const newBlocksPerMinute : nat; var s : farmFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateBlocksPerMinute"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function pauseAll(var s : farmFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  unpauseAll entrypoint *)
function unpauseAll(var s : farmFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : farmFactoryTogglePauseEntrypointType; const s : farmFactoryStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm factory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

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
function createFarm(const createFarmParams : createFarmType; var s : farmFactoryStorageType) : return is 
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCreateFarm"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaCreateFarm(createFarmParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(* trackFarm entrypoint *)
function trackFarm (const farmContract : address; var s : farmFactoryStorageType) : return is 
block{
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTrackFarm"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaTrackFarm(farmContract);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(* untrackFarm entrypoint *)
function untrackFarm (const farmContract : address; var s : farmFactoryStorageType) : return is 
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUntrackFarm"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function setLambda(const setLambdaParams : setLambdaType; var s : farmFactoryStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with(noOperations, s)



(* setProductLambda entrypoint *)
function setProductLambda(const setLambdaParams : setLambdaType; var s : farmFactoryStorageType) : return is
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
function main (const action : farmFactoryAction; var s : farmFactoryStorageType) : return is
block{
    
    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

} with(

    case action of [
        
            // Housekeeping Entrypoints
            SetAdmin (parameters)                   -> setAdmin(parameters, s)
        |   SetGovernance (parameters)              -> setGovernance(parameters, s)
        |   UpdateMetadata (parameters)             -> updateMetadata(parameters, s)
        |   UpdateConfig (parameters)               -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts (parameters)   -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts (parameters)     -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer (parameters)           -> mistakenTransfer(parameters, s)
        |   UpdateBlocksPerMinute (parameters)      -> updateBlocksPerMinute(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll (_parameters)                  -> pauseAll(s)
        |   UnpauseAll (_parameters)                -> unpauseAll(s)
        |   TogglePauseEntrypoint (parameters)      -> togglePauseEntrypoint(parameters, s)

            // Farm Factory Entrypoints
        |   CreateFarm (params)                     -> createFarm(params, s)
        |   TrackFarm (params)                      -> trackFarm(params, s)
        |   UntrackFarm (params)                    -> untrackFarm(params, s)

            // Lambda Entrypoints
        |   SetLambda (parameters)                  -> setLambda(parameters, s)
        |   SetProductLambda (parameters)           -> setProductLambda(parameters, s)
    ]
)