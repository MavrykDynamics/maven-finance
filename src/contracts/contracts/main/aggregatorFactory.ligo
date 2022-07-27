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

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// Aggregator Types
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Aggregator Factory Types
#include "../partials/contractTypes/aggregatorFactoryTypes.ligo"

// ------------------------------------------------------------------------------


type createAggregatorFuncType is (option(key_hash) * tez * aggregatorStorageType) -> (operation * address);
const createAggregatorFunc: createAggregatorFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/aggregator.tz"
        ;
          PAIR } |}
: createAggregatorFuncType)];

type aggregatorFactoryAction is
    
        // Housekeeping Entrypoints
    |   SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateMetadata                  of updateMetadataType
    |   UpdateConfig                    of aggregatorFactoryUpdateConfigParamsType
    |   UpdateWhitelistContracts        of updateWhitelistContractsType
    |   UpdateGeneralContracts          of updateGeneralContractsType
    |   MistakenTransfer                of transferActionType

        // Pause / Break Glass Entrypoints
    |   PauseAll                        of (unit)
    |   UnpauseAll                      of (unit)
    |   TogglePauseEntrypoint           of aggregatorFactoryTogglePauseEntrypointType

        // Aggregator Factory Entrypoints
    |   CreateAggregator                of createAggregatorParamsType
    |   TrackAggregator                 of trackAggregatorParamsType
    |   UntrackAggregator               of untrackAggregatorParamsType

        // Aggregator Entrypoints
    |   DistributeRewardXtz             of distributeRewardXtzType
    |   DistributeRewardStakedMvk       of distributeRewardStakedMvkType

        // Lambda Entrypoints
    |   SetLambda                       of setLambdaType
    |   SetProductLambda                of setLambdaType
    

const noOperations : list (operation) = nil;
type return is list (operation) * aggregatorFactoryStorageType;

// aggregator factory contract methods lambdas
type aggregatorFactoryUnpackLambdaFunctionType is (aggregatorFactoryLambdaActionType * aggregatorFactoryStorageType) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : aggregatorFactoryStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsAdmin(const s: aggregatorFactoryStorageType): unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



function checkSenderIsAdminOrGovernanceSatelliteContract(var s : aggregatorFactoryStorageType) : unit is
block{
    if Tezos.get_sender() = s.admin then skip
    else {
        const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
        if Tezos.get_sender() = governanceSatelliteAddress then skip
        else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
    }
} with unit



// Check that Sender is a tracked Aggregator address
function checkInTrackedAggregators(const aggregatorAddress : address; const s : aggregatorFactoryStorageType) : bool is 
block {

    var inTrackedAggregatorsMap : bool := False;
    for _key -> value in map s.trackedAggregators block {
        if aggregatorAddress = value then inTrackedAggregatorsMap := True
        else skip;
    }
    
} with inTrackedAggregatorsMap



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check that the %createAggregator entrypoint is not paused
function checkCreateAggregatorIsNotPaused(var s : aggregatorFactoryStorageType) : unit is
    if s.breakGlassConfig.createAggregatorIsPaused then failwith(error_CREATE_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %trackAggregator entrypoint is not paused
function checkTrackAggregatorIsNotPaused(var s : aggregatorFactoryStorageType) : unit is
    if s.breakGlassConfig.trackAggregatorIsPaused then failwith(error_TRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %untrackAggregator entrypoint is not paused
function checkUntrackAggregatorIsNotPaused(var s : aggregatorFactoryStorageType) : unit is
    if s.breakGlassConfig.untrackAggregatorIsPaused then failwith(error_UNTRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %distributeRewardXtz entrypoint is not paused
function checkDistributeRewardXtzIsNotPaused(var s : aggregatorFactoryStorageType) : unit is
    if s.breakGlassConfig.distributeRewardXtzIsPaused then failwith(error_DISTRIBUTE_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %distributeRewardStakedMvk entrypoint is not paused
function checkDistributeRewardStakedMvkIsNotPaused(var s : aggregatorFactoryStorageType) : unit is
    if s.breakGlassConfig.distributeRewardStakedMvkIsPaused then failwith(error_DISTRIBUTE_REWARD_STAKED_MVK_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to %addOracle entrypoint in a specified Aggregator Contract
function addOracleOperation(const aggregatorAddress: address; const satelliteAddress: address) : operation is
block{

    const tokenContract: contract(address) =
        case (Tezos.get_entrypoint_opt("%addOracle", aggregatorAddress) : option(contract(address))) of [
                Some (c) -> c
            |   None     -> (failwith(error_ADD_ORACLE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND) : contract(address))
        ];

} with (Tezos.transaction(satelliteAddress, 0tez, tokenContract))



// helper function to %removeOracle entrypoint in a specified Aggregator Contract
function removeOracleOperation(const aggregatorAddress: address; const satelliteAddress: address) : operation is
block{

    const tokenContract: contract(address) =
        case (Tezos.get_entrypoint_opt("%removeOracle", aggregatorAddress) : option(contract(address))) of [
                Some (c) -> c
            |   None     -> (failwith(error_REMOVE_ORACLE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND) : contract(address))
        ];

} with (Tezos.transaction(satelliteAddress, 0tez, tokenContract))



// helper function to get transfer entrypoint in treasury contract
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        contractAddress) : option(contract(transferActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
        ];



// helper function to get distributeReward entrypoint in delegation contract
function getDistributeRewardInDelegationEntrypoint(const contractAddress : address) : contract(distributeRewardStakedMvkType) is
    case (Tezos.get_entrypoint_opt(
        "%distributeReward",
        contractAddress) : option(contract(distributeRewardStakedMvkType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(distributeRewardStakedMvkType))
        ];


// helper function to get registerAggregator entrypoint in governanceSatellite contract
function getRegisterAggregatorInGovernanceSatelliteEntrypoint(const contractAddress : address) : contract(registerAggregatorActionType) is
    case (Tezos.get_entrypoint_opt(
        "%registerAggregator",
        contractAddress) : option(contract(registerAggregatorActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_REGISTER_AGGREGATOR_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND) : contract(registerAggregatorActionType))
        ];  


// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(aggregatorFactoryUnpackLambdaFunctionType)) of [
            Some(f) -> f(aggregatorFactoryLambdaAction, s)
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
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : aggregatorFactoryStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _ : unit; var s : aggregatorFactoryStorageType) : aggregatorFactoryConfigType is
    s.config



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; var s : aggregatorFactoryStorageType) : address is
    s.governanceAddress



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : aggregatorFactoryStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : aggregatorFactoryStorageType) : generalContractsType is
    s.generalContracts



(* View: get tracked aggregators *)
[@view] function getTrackedAggregators(const _ : unit; var s : aggregatorFactoryStorageType) : trackedAggregatorsType is
    s.trackedAggregators



(* View: get aggregator *)
[@view] function getAggregator (const pair : string * string ; const s : aggregatorFactoryStorageType) : address is block {
    const aggregatorAddress : address = case s.trackedAggregators[pair] of [
            Some(_address) -> _address
        |   None -> failwith(error_AGGREGATOR_CONTRACT_NOT_FOUND)
    ];
} with (aggregatorAddress)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : aggregatorFactoryStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : aggregatorFactoryStorageType) : lambdaLedgerType is
    s.lambdaLedger

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
function setAdmin(const newAdminAddress: address; const s: aggregatorFactoryStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : aggregatorFactoryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  updateMetadata entrypoint  *)
function updateMetadata(const updateMetadataParams: updateMetadataType; const s: aggregatorFactoryStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams: aggregatorFactoryUpdateConfigParamsType; const s: aggregatorFactoryStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsType; var s: aggregatorFactoryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsType; var s: aggregatorFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: aggregatorFactoryStorageType): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaMistakenTransfer(destinationParams);

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
function pauseAll(var s: aggregatorFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  unpauseAll entrypoint *)
function unpauseAll(var s: aggregatorFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint: aggregatorFactoryTogglePauseEntrypointType; const s: aggregatorFactoryStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

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
function createAggregator(const createAggregatorParams: createAggregatorParamsType; var s: aggregatorFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCreateAggregator"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaCreateAggregator(createAggregatorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  trackAggregator entrypoint  *)
function trackAggregator(const trackAggregatorParams: trackAggregatorParamsType; var s: aggregatorFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTrackAggregator"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaTrackAggregator(trackAggregatorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  untrackAggregator entrypoint  *)
function untrackAggregator(const untrackAggregatorParams: untrackAggregatorParamsType; var s: aggregatorFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUntrackAggregator"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUntrackAggregator(untrackAggregatorParams);

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
function distributeRewardXtz(const distributeRewardXtzParams : distributeRewardXtzType; var s: aggregatorFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDistributeRewardXtz"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaDistributeRewardXtz(distributeRewardXtzParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  distributeRewardStakedMvk entrypoint  *)
function distributeRewardStakedMvk(const distributeRewardStakedMvkParams : distributeRewardStakedMvkType; var s: aggregatorFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDistributeRewardStakedMvk"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function setLambda(const setLambdaParams : setLambdaType; var s : aggregatorFactoryStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)



(* setProductLambda entrypoint *)
function setProductLambda(const setLambdaParams: setLambdaType; var s: aggregatorFactoryStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.aggregatorLambdaLedger[lambdaName] := lambdaBytes;

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
function main (const action : aggregatorFactoryAction; const s : aggregatorFactoryStorageType) : return is
block{

    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

} with (
    case action of [

            // Housekeeping Entrypoints
        |   SetAdmin (parameters)                         -> setAdmin(parameters, s)
        |   SetGovernance (parameters)                    -> setGovernance(parameters, s)
        |   UpdateMetadata (parameters)                   -> updateMetadata(parameters, s)
        |   UpdateConfig (parameters)                     -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts (parameters)         -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts (parameters)           -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer (parameters)                 -> mistakenTransfer(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll (_parameters)                        -> pauseAll(s)
        |   UnpauseAll (_parameters)                      -> unpauseAll(s)
        |   TogglePauseEntrypoint (parameters)            -> togglePauseEntrypoint(parameters, s)

            // Aggregator Factory Entrypoints  
        |   CreateAggregator (parameters)                 -> createAggregator(parameters, s)
        |   TrackAggregator (parameters)                  -> trackAggregator(parameters, s)
        |   UntrackAggregator (parameters)                -> untrackAggregator(parameters, s)

            // Aggregator Entrypoints
        |   DistributeRewardXtz (parameters)              -> distributeRewardXtz(parameters, s)
        |   DistributeRewardStakedMvk (parameters)        -> distributeRewardStakedMvk(parameters, s)

            // Lambda Entrypoints
        |   SetLambda (parameters)                        -> setLambda(parameters, s)
        |   SetProductLambda (parameters)                 -> setProductLambda(parameters, s)
    ]
)
