// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Aggregator Types
#include "../partials/types/aggregatorTypes.ligo"

// Aggregator Factory Types
#include "../partials/types/aggregatorFactoryTypes.ligo"

// ------------------------------------------------------------------------------

type aggregatorFactoryAction is
    
      // Housekeeping Entrypoints
    | SetAdmin                    of setAdminParams
    | UpdateMetadata              of updateMetadataType

      // Aggregator Factory Entrypoints
    | UpdateAggregatorAdmin       of updateAggregatorAdminParamsType
    | UpdateAggregatorConfig      of updateAggregatorConfigParamsType
    | AddSatellite                of (address)
    | BanSatellite                of (address)
    | CreateAggregator            of createAggregatorParamsType

      // Lambda Entrypoints
    | SetLambda                   of setLambdaType
    | SetProductLambda            of setLambdaType
    

const noOperations : list (operation) = nil;
type return is list (operation) * aggregatorFactoryStorage;

// aggregator factory contract methods lambdas
type aggregatorFactoryUnpackLambdaFunctionType is (aggregatorFactoryLambdaActionType * aggregatorFactoryStorage) -> return



// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                             = 0n;
[@inline] const error_ONLY_MAINTAINER_ALLOWED                                = 1n;
[@inline] const error_ACTION_FAILED_AS_SATELLITE_IS_NOT_REGISTERED           = 2n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                      = 3n;

[@inline] const error_ADD_ORACLE_ENTRYPOINT_NOT_FOUND                        = 4n;
[@inline] const error_REMOVE_ORACLE_ENTRYPOINT_NOT_FOUND                     = 5n;
[@inline] const error_UPDATE_AGGREGATOR_CONFIG_ENTRYPOINT_NOT_FOUND          = 6n;
[@inline] const error_UPDATE_ADMIN_ENTRYPOINT_NOT_FOUND                      = 7n;
[@inline] const error_AGGREGATOR_IN_GET_AGGREGATOR_VIEW_NOT_FOUND            = 8n;

[@inline] const error_LAMBDA_NOT_FOUND                                       = 9n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                = 10n;

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

function checkSenderIsAdmin(const s: aggregatorFactoryStorage): unit is
  if Tezos.sender =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
  else unit



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



function checkIfAddressContainInTrackedSatelliteSet(const satelliteAddress: address; const trackedSatellite: trackedSatelliteType): unit is
  if not (trackedSatellite contains satelliteAddress) then failwith(error_ACTION_FAILED_AS_SATELLITE_IS_NOT_REGISTERED)
  else unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
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
[@view] function getAggregator (const pair : string*string ; const s : aggregatorFactoryStorage) : address is block {
  const aggregatorAddress : address = case s.trackedAggregators[pair] of [
    Some(_address) -> _address
    | None -> failwith(error_AGGREGATOR_IN_GET_AGGREGATOR_VIEW_NOT_FOUND)
  ];
} with (aggregatorAddress)

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

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Aggregator Factory Entrypoints Begin
// ------------------------------------------------------------------------------

(*  updateAggregatorAdmin entrypoint  *)
function updateAggregatorAdmin(const updateAggregatorAdminParams: updateAggregatorAdminParamsType; var s: aggregatorFactoryStorage): return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateAggregatorAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUpdateAggregatorAdmin(updateAggregatorAdminParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  updateAggregatorConfig entrypoint  *)
function updateAggregatorConfig(const updateAggregatorConfigParams: updateAggregatorConfigParamsType; var s: aggregatorFactoryStorage): return is
block{
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateAggregatorConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUpdateAggregatorConfig(updateAggregatorConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);    

} with response



(*  addSatellite entrypoint  *)
function addSatellite(const satelliteAddress: address; var s: aggregatorFactoryStorage): return is
block{
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaAddSatellite(satelliteAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  banSatellite entrypoint  *)
function banSatellite(const satelliteAddress: address; var s: aggregatorFactoryStorage): return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaBanSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaBanSatellite(satelliteAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



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

// ------------------------------------------------------------------------------
// Aggregator Factory Entrypoints Begin
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
      | SetAdmin (parameters)                 -> setAdmin(parameters, s)
      | UpdateMetadata (parameters)           -> updateMetadata(parameters, s)

        // Aggregator Factory Entrypoints  
      | UpdateAggregatorAdmin (parameters)    -> updateAggregatorAdmin(parameters, s)
      | UpdateAggregatorConfig (parameters)   -> updateAggregatorConfig(parameters, s)
      | AddSatellite (parameters)             -> addSatellite(parameters, s)
      | BanSatellite (parameters)             -> banSatellite(parameters, s)
      | CreateAggregator (parameters)         -> createAggregator(parameters, s)

        // Lambda Entrypoints
      | SetLambda (parameters)                -> setLambda(parameters, s)
      | SetProductLambda (parameters)         -> setProductLambda(parameters, s)
    ]
