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

// Governance Satellite Types
#include "../partials/types/governanceSatelliteTypes.ligo"

// ------------------------------------------------------------------------------


type governanceSatelliteAction is 
      
      // Housekeeping Actions
    | SetAdmin                      of address
    | UpdateMetadata                of updateMetadataType
    | UpdateConfig                  of governanceSatelliteUpdateConfigParamsType
    | UpdateWhitelistContracts      of updateWhitelistContractsParams
    | UpdateGeneralContracts        of updateGeneralContractsParams

      // Satellite Governance
    | SuspendSatellite              of suspendSatelliteActionType
    | UnsuspendSatellite            of unsuspendSatelliteActionType
    | BanSatellite                  of banSatelliteActionType
    | UnbanSatellite                of unbanSatelliteActionType

      // Satellite Oracle Governance
    | RemoveAllSatelliteOracles     of removeAllSatelliteOraclesActionType
    | AddOracleToAggregator         of addOracleToAggregatorActionType
    | RemoveOracleInAggregator      of removeOracleInAggregatorActionType

      // Governance Actions
    | DropAction                    of dropActionType
    | VoteForAction                 of voteForActionType

const noOperations : list (operation) = nil;
type return is list (operation) * governanceSatelliteStorage

// governance satellite contract methods lambdas
type governanceSatelliteUnpackLambdaFunctionType is (governanceSatelliteLambdaActionType * governanceSatelliteStorage) -> return




// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                             = 0n;
[@inline] const error_ONLY_SATELLITE_ALLOWED                                 = 1n;

[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                      = 3n;
[@inline] const error_NOT_ENOUGH_TEZ_RECEIVED                                = 4n;

[@inline] const error_GET_SATELLITE_OPT_VIEW_NOT_FOUND                       = 5n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TOKEN_CONTRACT_NOT_FOUND        = 6n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_SNAPSHOT_NOT_FOUND         = 7n;

[@inline] const error_LAMBDA_NOT_FOUND                                       = 8n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                = 9n;

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

function checkSenderIsAdmin(const s: governanceSatelliteStorage): unit is
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
// General Helper Functions Begin
// ------------------------------------------------------------------------------

function setSatelliteSnapshot(const satelliteSnapshot : actionSatelliteSnapshotType; var s : governanceSatelliteStorage) : governanceSatelliteStorage is 
block {
    // init variables
    const actionId              : nat     = satelliteSnapshot.actionId;
    const satelliteAddress      : address = satelliteSnapshot.satelliteAddress;
    const stakedMvkBalance      : nat     = satelliteSnapshot.stakedMvkBalance; 
    const totalDelegatedAmount  : nat     = satelliteSnapshot.totalDelegatedAmount; 

    const maxTotalVotingPower = abs(stakedMvkBalance * 10000 / s.config.votingPowerRatio);
    const mvkBalanceAndTotalDelegatedAmount = stakedMvkBalance + totalDelegatedAmount; 
    var totalVotingPower : nat := 0n;
    if mvkBalanceAndTotalDelegatedAmount > maxTotalVotingPower then totalVotingPower := maxTotalVotingPower
    else totalVotingPower := mvkBalanceAndTotalDelegatedAmount;

    var satelliteSnapshotRecord : governanceSatelliteSnapshotRecordType := record [
        totalMvkBalance         = stakedMvkBalance; 
        totalDelegatedAmount    = totalDelegatedAmount; 
        totalVotingPower        = totalVotingPower;
      ];
    
    var governanceSatelliteActionSnapshot : governanceSatelliteSnapshotMapType := case s.governanceSatelliteSnapshotLedger[actionId] of [ 
        None -> failwith(error_GOVERNANCE_SATELLITE_ACTION_SNAPSHOT_NOT_FOUND)
      | Some(snapshot) -> snapshot
    ];

    // update governance satellite snapshot map with record of satellite's total voting power
    governanceSatelliteActionSnapshot[satelliteAddress]       := satelliteSnapshotRecord;

    // update governance satellite snapshot ledger bigmap with updated satellite's details
    s.governanceSatelliteSnapshotLedger[actionId]   := governanceSatelliteActionSnapshot;

} with (s)

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceSatelliteUnpackLambdaFunctionType)) of [
        Some(f) -> f(governanceSatelliteLambdaAction, s)
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

// Governance Satellite Lambdas:
#include "../partials/contractLambdas/governanceSatellite/governanceSatelliteLambdas.ligo"

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

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : governanceSatelliteStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : governanceSatelliteStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : governanceSatelliteUpdateConfigParamsType; var s : governanceSatelliteStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint  *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: governanceSatelliteStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: governanceSatelliteStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(*  suspendSatellite entrypoint  *)
function suspendSatellite(const suspendSatelliteParams : suspendSatelliteActionType ; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSuspendSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaSuspendSatellite(suspendSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  unsuspendSatellite entrypoint  *)
function unsuspendSatellite(const unsuspendSatelliteParams : unsuspendSatelliteActionType ; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnsuspendSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUnsuspendSatellite(unsuspendSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  banSatellite entrypoint  *)
function banSatellite(const banSatelliteParams : banSatelliteActionType; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaBanSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaBanSatellite(banSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  unbanSatellite entrypoint  *)
function unbanSatellite(const unbanSatelliteParams : unbanSatelliteActionType; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnbanSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUnbanSatellite(unbanSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Satellite Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Oracle Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(*  removeAllSatelliteOracles entrypoint  *)
function removeAllSatelliteOracles(const removeAllSatelliteOraclesParams : removeAllSatelliteOraclesActionType; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveAllSatelliteOracles"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaRemoveAllSatelliteOracles(removeAllSatelliteOraclesParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  addOracleToAggregator entrypoint  *)
function addOracleToAggregator(const addOracleToAggregatorParams : addOracleToAggregatorActionType; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddOracleToAggregator"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaAddOracleToAggregator(addOracleToAggregatorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);
    
} with response



(*  removeOracleInAggregator entrypoint  *)
function removeOracleInAggregator(const removeOracleInAggregatorParams : removeOracleInAggregatorActionType; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveOracleInAggregator"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaRemoveOracleInAggregator(removeOracleInAggregatorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Satellite Oracle Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Actions Entrypoints Begin
// ------------------------------------------------------------------------------

(*  voteForAction entrypoint  *)
function voteForAction(const voteForActionParams : voteForActionType; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVoteForAction"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaVoteForAction(voteForActionParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  dropAction entrypoint  *)
function dropAction(const dropActionParams : dropActionType; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDropAction"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaDropAction(dropActionParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Governance Actions Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : governanceSatelliteAction; const s : governanceSatelliteStorage) : return is 
    case action of [
        
          // Housekeeping Actions
        | SetAdmin(parameters)                      -> setAdmin(parameters, s)
        | UpdateMetadata(parameters)                -> updateMetadata(parameters, s)  
        | UpdateConfig(parameters)                  -> updateConfig(parameters, s)
        | UpdateWhitelistContracts(parameters)      -> updateWhitelistContracts(parameters, s)
        | UpdateGeneralContracts(parameters)        -> updateGeneralContracts(parameters, s)

          // Satellite Governance 
        | SuspendSatellite(parameters)              -> suspendSatellite(parameters, s)
        | UnsuspendSatellite(parameters)            -> unsuspendSatellite(parameters, s)
        | BanSatellite(parameters)                  -> banSatellite(parameters, s)
        | UnbanSatellite(parameters)                -> unbanSatellite(parameters, s)

          // Satellite Oracle Governance
        | RemoveAllSatelliteOracles(parameters)     -> removeAllSatelliteOracles(parameters, s)
        | AddOracleToAggregator(parameters)         -> addOracleToAggregator(parameters, s)
        | RemoveOracleInAggregator(parameters)      -> removeOracleInAggregator(parameters, s)

          // Governance Actions
        | DropAction(parameters)                    -> dropAction(parameters, s)
        | VoteForAction(parameters)                 -> voteForAction(parameters, s)

    ]