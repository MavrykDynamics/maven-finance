// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"

// Treasury transfers Type
#include "../partials/functionalTypes/treasuryTransferTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Treasury Transfer Types
#include "../partials/functionalTypes/treasuryTransferTypes.ligo"

// Aggregator Types
#include "../partials/types/aggregatorTypes.ligo"

// Aggregator Factory Types
#include "../partials/types/aggregatorFactoryTypes.ligo"

// ------------------------------------------------------------------------------

type aggregatorFactoryAction is
    
      // Housekeeping Entrypoints
    | SetAdmin                        of setAdminParams
    | SetGovernance                   of (address)
    | UpdateMetadata                  of updateMetadataType
    | UpdateWhitelistContracts        of updateWhitelistContractsParams
    | UpdateGeneralContracts          of updateGeneralContractsParams

      // Pause / Break Glass Entrypoints
    | PauseAll                        of (unit)
    | UnpauseAll                      of (unit)
    | TogglePauseCreateAggregator     of (unit)
    | TogglePauseTrackAggregator      of (unit)
    | TogglePauseUntrackAggregator    of (unit)
    | TogglePauseDistributeRewardXtz  of (unit)
    | TogglePauseDistributeRewardSMvk of (unit)

      // Aggregator Factory Entrypoints
    | CreateAggregator                of createAggregatorParamsType
    | TrackAggregator                 of (address)
    | UntrackAggregator               of (address)

      // Aggregator Entrypoints
    | DistributeRewardXtz             of distributeRewardXtzType
    | DistributeRewardStakedMvk       of distributeRewardStakedMvkType

      // Lambda Entrypoints
    | SetLambda                       of setLambdaType
    | SetProductLambda                of setLambdaType
    

const noOperations : list (operation) = nil;
type return is list (operation) * aggregatorFactoryStorage;

// aggregator factory contract methods lambdas
type aggregatorFactoryUnpackLambdaFunctionType is (aggregatorFactoryLambdaActionType * aggregatorFactoryStorage) -> return



// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

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

function checkSenderIsAllowed(var s : aggregatorFactoryStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
        else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsAdmin(const s: aggregatorFactoryStorage): unit is
  if Tezos.sender =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
  else unit



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



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

function checkCreateAggregatorIsNotPaused(var s : aggregatorFactoryStorage) : unit is
    if s.breakGlassConfig.createAggregatorIsPaused then failwith(error_CREATE_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED)
    else unit;

function checkTrackAggregatorIsNotPaused(var s : aggregatorFactoryStorage) : unit is
    if s.breakGlassConfig.trackAggregatorIsPaused then failwith(error_TRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED)
    else unit;

function checkUntrackAggregatorIsNotPaused(var s : aggregatorFactoryStorage) : unit is
    if s.breakGlassConfig.untrackAggregatorIsPaused then failwith(error_UNTRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED)
    else unit;

function checkDistributeRewardXtzIsNotPaused(var s : aggregatorFactoryStorage) : unit is
    if s.breakGlassConfig.distributeRewardXtzIsPaused then failwith(error_DISTRIBUTE_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED)
    else unit;

function checkDistributeRewardMvkIsNotPaused(var s : aggregatorFactoryStorage) : unit is
    if s.breakGlassConfig.distributeRewardMvkIsPaused then failwith(error_DISTRIBUTE_REWARD_MVK_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

function addOracleOperation(const aggregatorAddress: address; const satelliteAddress: address): operation is
block{
    const tokenContract: contract(address) =
        case (Tezos.get_entrypoint_opt("%addOracle", aggregatorAddress): option(contract(address))) of [
              Some (c) -> c
          |   None -> (failwith(error_ADD_ORACLE_ENTRYPOINT_NOT_FOUND): contract(address))
        ];
} with (Tezos.transaction(satelliteAddress, 0tez, tokenContract))



function removeOracleOperation(const aggregatorAddress: address; const satelliteAddress: address): operation is
block{
    const tokenContract: contract(address) =
        case (Tezos.get_entrypoint_opt("%removeOracle", aggregatorAddress): option(contract(address))) of [
              Some (c) -> c
          |   None -> (failwith(error_REMOVE_ORACLE_ENTRYPOINT_NOT_FOUND): contract(address))
        ];
} with (Tezos.transaction(satelliteAddress, 0tez, tokenContract))



function updateAggregatorConfigOperation(const aggregatorAddress: address; const newAggregatorConfig: aggregatorConfigType): operation is
block{
    const tokenContract: contract(aggregatorConfigType) =
        case (Tezos.get_entrypoint_opt("%updateConfig", aggregatorAddress): option(contract(aggregatorConfigType))) of [
              Some (c) -> c
          |   None -> (failwith(error_UPDATE_AGGREGATOR_CONFIG_ENTRYPOINT_NOT_FOUND): contract(aggregatorConfigType))
        ];
} with (Tezos.transaction(newAggregatorConfig, 0tez, tokenContract))



function updateAggregatorAdminOperation(const aggregatorAddress: address; const adminAddress: address): operation is
block{
    const tokenContract: contract(address) =
        case (Tezos.get_entrypoint_opt("%updateAdmin", aggregatorAddress): option(contract(address))) of [
              Some (c) -> c
          |   None -> (failwith(error_UPDATE_ADMIN_ENTRYPOINT_NOT_FOUND): contract(address))
        ];
} with (Tezos.transaction(adminAddress, 0tez, tokenContract))



// helper function to get transfer entrypoint in treasury contract
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
  case (Tezos.get_entrypoint_opt(
      "%transfer",
      contractAddress) : option(contract(transferActionType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
  ];



// helper function to get distributeReward entrypoint in delegation contract
function getDistributeRewardInDelegationEntrypoint(const contractAddress : address) : contract(distributeRewardStakedMvkType) is
case (Tezos.get_entrypoint_opt(
      "%distributeReward",
      contractAddress) : option(contract(distributeRewardStakedMvkType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(distributeRewardStakedMvkType))
];


// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorage) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(aggregatorFactoryUnpackLambdaFunctionType)) of [
        Some(f) -> f(aggregatorFactoryLambdaAction, s)
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
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get aggregator *)
// [@view] function getAggregator (const pair : string * string ; const s : aggregatorFactoryStorage) : address is block {
//   const aggregatorAddress : address = case s.trackedAggregators[pair] of [
//     Some(_address) -> _address
//     | None -> failwith(error_AGGREGATOR_IN_GET_AGGREGATOR_VIEW_NOT_FOUND)
//   ];
// } with (aggregatorAddress)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Lambda Methods Begin
//
// ------------------------------------------------------------------------------

// Aggregator Factory Lambdas:
#include "../partials/contractLambdas/aggregatorFactory/aggregatorFactoryLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Methods End
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

(*  setAdmin entrypoint  *)
function setAdmin(const newAdminAddress: adminType; const s: aggregatorFactoryStorage): return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : aggregatorFactoryStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  updateMetadata entrypoint  *)
function updateMetadata(const updateMetadataParams: updateMetadataType; const s: aggregatorFactoryStorage): return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: aggregatorFactoryStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: aggregatorFactoryStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAll entrypoint *)
function pauseAll(var s: aggregatorFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  unpauseAll entrypoint *)
function unpauseAll(var s: aggregatorFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  togglePauseCreateAggregator entrypoint *)
function togglePauseCreateAggregator(var s: aggregatorFactoryStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseCreateAgg"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaTogglePauseCreateAgg(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  togglePauseUntrackAggregator entrypoint *)
function togglePauseUntrackAggregator(var s: aggregatorFactoryStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseUntrackAgg"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaTogglePauseUntrackAgg(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  togglePauseTrackAggregator entrypoint *)
function togglePauseTrackAggregator(var s: aggregatorFactoryStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseTrackAgg"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaTogglePauseTrackAgg(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  togglePauseDistributeRewardXtz entrypoint *)
function togglePauseDistributeRewardXtz(var s: aggregatorFactoryStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseDisRewardXtz"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaTogglePauseDisRewardXtz(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  togglePauseDistributeRewardSMvk entrypoint *)
function togglePauseDistributeRewardSMvk(var s: aggregatorFactoryStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseDisRewardSMvk"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaTogglePauseDisRewardSMvk(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------




// ------------------------------------------------------------------------------
// Aggregator Factory Entrypoints Begin
// ------------------------------------------------------------------------------

(*  createAggregator entrypoint  *)
function createAggregator(const createAggregatorParams: createAggregatorParamsType; var s: aggregatorFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCreateAggregator"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaCreateAggregator(createAggregatorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  trackAggregator entrypoint  *)
function trackAggregator(const aggregatorAddress: address; var s: aggregatorFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTrackAggregator"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaTrackAggregator(aggregatorAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  untrackAggregator entrypoint  *)
function untrackAggregator(const aggregatorAddress: address; var s: aggregatorFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUntrackAggregator"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUntrackAggregator(aggregatorAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Aggregator Factory Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Aggregator Entrypoints Begin
// ------------------------------------------------------------------------------

(*  distributeRewardXtz entrypoint  *)
function distributeRewardXtz(const distributeRewardXtzParams : distributeRewardXtzType; var s: aggregatorFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDistributeRewardXtz"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaDistributeRewardXtz(distributeRewardXtzParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  distributeRewardStakedMvk entrypoint  *)
function distributeRewardStakedMvk(const distributeRewardStakedMvkParams : distributeRewardStakedMvkType; var s: aggregatorFactoryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDistributeRewardStakedMvk"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaDistributeRewardStakedMvk(distributeRewardStakedMvkParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Aggregator Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : aggregatorFactoryStorage): return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with(noOperations, s)



(* setProductLambda entrypoint *)
function setProductLambda(const setLambdaParams: setLambdaType; var s: aggregatorFactoryStorage): return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.aggregatorLambdaLedger[lambdaName] := lambdaBytes;

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
function main (const action : aggregatorFactoryAction; const s : aggregatorFactoryStorage) : return is

    case action of [

        // Housekeeping Entrypoints
      | SetAdmin (parameters)                         -> setAdmin(parameters, s)
      | SetGovernance (parameters)                    -> setGovernance(parameters, s)
      | UpdateMetadata (parameters)                   -> updateMetadata(parameters, s)
      | UpdateWhitelistContracts (parameters)         -> updateWhitelistContracts(parameters, s)
      | UpdateGeneralContracts (parameters)           -> updateGeneralContracts(parameters, s)

        // Pause / Break Glass Entrypoints
      | PauseAll (_parameters)                        -> pauseAll(s)
      | UnpauseAll (_parameters)                      -> unpauseAll(s)
      | TogglePauseCreateAggregator (_parameters)     -> togglePauseCreateAggregator(s)
      | TogglePauseTrackAggregator (_parameters)      -> togglePauseTrackAggregator(s)
      | TogglePauseUntrackAggregator (_parameters)    -> togglePauseUntrackAggregator(s)
      | TogglePauseDistributeRewardXtz (_parameters)  -> togglePauseDistributeRewardXtz(s)
      | TogglePauseDistributeRewardSMvk (_parameters) -> togglePauseDistributeRewardSMvk(s)

        // Aggregator Factory Entrypoints  
      | CreateAggregator (parameters)                 -> createAggregator(parameters, s)
      | TrackAggregator (parameters)                  -> trackAggregator(parameters, s)
      | UntrackAggregator (parameters)                -> untrackAggregator(parameters, s)

        // Aggregator Entrypoints
      | DistributeRewardXtz (parameters)              -> distributeRewardXtz(parameters, s)
      | DistributeRewardStakedMvk (parameters)        -> distributeRewardStakedMvk(parameters, s)

        // Lambda Entrypoints
      | SetLambda (parameters)                        -> setLambda(parameters, s)
      | SetProductLambda (parameters)                 -> setProductLambda(parameters, s)
    ]
