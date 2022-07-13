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

// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Transfer Types : transferDestinationType
#include "../partials/shared/transferTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// Governance Satellite Types
#include "../partials/contractTypes/governanceSatelliteTypes.ligo"

// ------------------------------------------------------------------------------


type governanceSatelliteAction is 
      
        // Housekeeping Actions
    |   SetAdmin                      of address
    |   SetGovernance                 of address
    |   UpdateMetadata                of updateMetadataType
    |   UpdateConfig                  of governanceSatelliteUpdateConfigParamsType
    |   UpdateWhitelistContracts      of updateWhitelistContractsType
    |   UpdateGeneralContracts        of updateGeneralContractsType

        // Satellite Governance
    |   SuspendSatellite              of suspendSatelliteActionType
    |   UnsuspendSatellite            of unsuspendSatelliteActionType
    |   BanSatellite                  of banSatelliteActionType
    |   UnbanSatellite                of unbanSatelliteActionType

        // Satellite Oracle Governance
    |   RemoveAllSatelliteOracles     of removeAllSatelliteOraclesActionType
    |   AddOracleToAggregator         of addOracleToAggregatorActionType
    |   RemoveOracleInAggregator      of removeOracleInAggregatorActionType

        // Aggregator Governance
    |   SetAggregatorMaintainer       of setAggregatorMaintainerActionType    
    |   RegisterAggregator            of registerAggregatorActionType
    |   UpdateAggregatorStatus        of updateAggregatorStatusActionType

        // Governance Vote Actions
    |   DropAction                    of dropActionType
    |   VoteForAction                 of voteForActionType

        // Lambda Entrypoints
    |   SetLambda                     of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * governanceSatelliteStorageType

// governance satellite contract methods lambdas
type governanceSatelliteUnpackLambdaFunctionType is (governanceSatelliteLambdaActionType * governanceSatelliteStorageType) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin, Governance Contract
function checkSenderIsAllowed(var s : governanceSatelliteStorageType) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders : Admin
function checkSenderIsAdmin(const s : governanceSatelliteStorageType): unit is
    if Tezos.sender =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

function setSatelliteSnapshot(const satelliteSnapshot : actionSatelliteSnapshotType; const votingPowerRatio : nat; var s : governanceSatelliteStorageType) : governanceSatelliteStorageType is 
block {

    // init variables
    const actionId              : nat     = satelliteSnapshot.actionId;
    const satelliteAddress      : address = satelliteSnapshot.satelliteAddress;
    const stakedMvkBalance      : nat     = satelliteSnapshot.stakedMvkBalance; 
    const totalDelegatedAmount  : nat     = satelliteSnapshot.totalDelegatedAmount; 

    const maxTotalVotingPower = abs(stakedMvkBalance * 10000 / votingPowerRatio);
    const mvkBalanceAndTotalDelegatedAmount = stakedMvkBalance + totalDelegatedAmount; 
    var totalVotingPower : nat := 0n;
    if mvkBalanceAndTotalDelegatedAmount > maxTotalVotingPower then totalVotingPower := maxTotalVotingPower
    else totalVotingPower := mvkBalanceAndTotalDelegatedAmount;

    var satelliteSnapshotRecord : satelliteSnapshotRecordType := record [
        totalStakedMvkBalance   = stakedMvkBalance; 
        totalDelegatedAmount    = totalDelegatedAmount; 
        totalVotingPower        = totalVotingPower;
    ];
    
    var governanceSatelliteActionSnapshot : governanceSatelliteSnapshotMapType := case s.governanceSatelliteSnapshotLedger[actionId] of [ 
            None -> failwith(error_GOVERNANCE_SATELLITE_ACTION_SNAPSHOT_NOT_FOUND)
        |   Some(snapshot) -> snapshot
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
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get addOracle entrypoint in aggregator contract
function getAddOracleInAggregatorEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%addOracle",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ADD_ORACLE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND) : contract(address))
        ];



// helper function to get removeOracle entrypoint in aggregator contract
function getRemoveOracleInAggregatorEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%removeOracle",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_REMOVE_ORACLE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND) : contract(address))
        ];



// helper function to get pauseAll entrypoint in aggregator contract
function getPauseAllInAggregatorEntrypoint(const contractAddress : address) : contract(unit) is
    case (Tezos.get_entrypoint_opt(
        "%pauseAll",
        contractAddress) : option(contract(unit))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_PAUSE_ALL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND) : contract(unit))
        ];



// helper function to get unpauseAll entrypoint in aggregator contract
function getUnpauseAllInAggregatorEntrypoint(const contractAddress : address) : contract(unit) is
    case (Tezos.get_entrypoint_opt(
        "%unpauseAll",
        contractAddress) : option(contract(unit))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_UNPAUSE_ALL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND) : contract(unit))
        ];



// helper function to get updateSatelliteStatus entrypoint in delegation contract
function getUpdateSatelliteStatusInDelegationEntrypoint(const contractAddress : address) : contract(updateSatelliteStatusParamsType) is
    case (Tezos.get_entrypoint_opt(
        "%updateSatelliteStatus",
        contractAddress) : option(contract(updateSatelliteStatusParamsType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_UPDATE_SATELLITE_STATUS_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(updateSatelliteStatusParamsType))
        ];


// helper function to get setMaintainer entrypoint in aggregator contract
function getSetMaintainerInAggregatorEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%setMaintainer",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_SET_MAINTAINER_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND) : contract(address))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceSatelliteUnpackLambdaFunctionType)) of [
            Some(f) -> f(governanceSatelliteLambdaAction, s)
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

(* View: get admin *)
[@view] function getAdmin(const _ : unit; var s : governanceSatelliteStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _ : unit; var s : governanceSatelliteStorageType) : governanceSatelliteConfigType is
    s.config



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; var s : governanceSatelliteStorageType) : address is
    s.governanceAddress



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : governanceSatelliteStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : governanceSatelliteStorageType) : generalContractsType is
    s.generalContracts



(* View: get a governance satellite action *)
[@view] function getGovernanceSatelliteActionOpt(const actionId : nat; var s : governanceSatelliteStorageType) : option(governanceSatelliteActionRecordType) is
    Big_map.find_opt(actionId, s.governanceSatelliteActionLedger)



(* View: get a governance satellite action snapshot *)
[@view] function getGovernanceActionSnapshotOpt(const actionId : nat; var s : governanceSatelliteStorageType) : option(governanceSatelliteSnapshotMapType) is
    Big_map.find_opt(actionId, s.governanceSatelliteSnapshotLedger)



(* View: get governance satellite counter *)
[@view] function getGovernanceSatelliteCounter(const _ : unit; var s : governanceSatelliteStorageType) : nat is
    s.governanceSatelliteCounter



(* View: get a satellite oracle record *)
[@view] function getSatelliteOracleRecordOpt(const satelliteAddress : address; var s : governanceSatelliteStorageType) : option(satelliteOracleRecordType) is
    Big_map.find_opt(satelliteAddress, s.satelliteOracleLedger)



(* View: get an aggregator record *)
[@view] function getAggregatorRecordOpt(const aggregatorAddress : address; var s : governanceSatelliteStorageType) : option(aggregatorRecordType) is
    Big_map.find_opt(aggregatorAddress, s.aggregatorLedger)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : governanceSatelliteStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : governanceSatelliteStorageType) : lambdaLedgerType is
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

// Governance Satellite Lambdas :
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
function setAdmin(const newAdminAddress : address; var s : governanceSatelliteStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : governanceSatelliteStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : governanceSatelliteStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : governanceSatelliteUpdateConfigParamsType; var s : governanceSatelliteStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint  *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : governanceSatelliteStorageType): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : governanceSatelliteStorageType): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function suspendSatellite(const suspendSatelliteParams : suspendSatelliteActionType ; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSuspendSatellite"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaSuspendSatellite(suspendSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  unsuspendSatellite entrypoint  *)
function unsuspendSatellite(const unsuspendSatelliteParams : unsuspendSatelliteActionType ; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnsuspendSatellite"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUnsuspendSatellite(unsuspendSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  banSatellite entrypoint  *)
function banSatellite(const banSatelliteParams : banSatelliteActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaBanSatellite"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaBanSatellite(banSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  unbanSatellite entrypoint  *)
function unbanSatellite(const unbanSatelliteParams : unbanSatelliteActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnbanSatellite"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function removeAllSatelliteOracles(const removeAllSatelliteOraclesParams : removeAllSatelliteOraclesActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveAllSatelliteOracles"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaRemoveAllSatelliteOracles(removeAllSatelliteOraclesParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  addOracleToAggregator entrypoint  *)
function addOracleToAggregator(const addOracleToAggregatorParams : addOracleToAggregatorActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddOracleToAggregator"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaAddOracleToAggregator(addOracleToAggregatorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);
    
} with response



(*  removeOracleInAggregator entrypoint  *)
function removeOracleInAggregator(const removeOracleInAggregatorParams : removeOracleInAggregatorActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveOracleInAggregator"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
// Aggregator Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAggregatorMaintainer entrypoint  *)
function setAggregatorMaintainer(const setAggregatorMaintainerParams : setAggregatorMaintainerActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAggregatorMaintainer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaSetAggregatorMaintainer(setAggregatorMaintainerParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  registerAggregator entrypoint  *)
function registerAggregator(const registerAggregatorParams : registerAggregatorActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRegisterAggregator"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaRegisterAggregator(registerAggregatorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  updateAggregatorStatus entrypoint  *)
function updateAggregatorStatus(const updateAggregatorStatusParams : updateAggregatorStatusActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateAggregatorStatus"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUpdateAggregatorStatus(updateAggregatorStatusParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Aggregator Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Actions Entrypoints Begin
// ------------------------------------------------------------------------------

(*  voteForAction entrypoint  *)
function voteForAction(const voteForActionParams : voteForActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVoteForAction"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaVoteForAction(voteForActionParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  dropAction entrypoint  *)
function dropAction(const dropActionParams : dropActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDropAction"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : governanceSatelliteStorageType): return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;

    // set lambda in lambdaLedger - allow override of lambdas
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
function main (const action : governanceSatelliteAction; const s : governanceSatelliteStorageType) : return is
block{

    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

} with (
    
    case action of [

            // Housekeeping Actions
        |   SetAdmin(parameters)                      -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                 -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)                -> updateMetadata(parameters, s)  
        |   UpdateConfig(parameters)                  -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)      -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)        -> updateGeneralContracts(parameters, s)

            // Satellite Governance 
        |   SuspendSatellite(parameters)              -> suspendSatellite(parameters, s)
        |   UnsuspendSatellite(parameters)            -> unsuspendSatellite(parameters, s)
        |   BanSatellite(parameters)                  -> banSatellite(parameters, s)
        |   UnbanSatellite(parameters)                -> unbanSatellite(parameters, s)

            // Satellite Oracle Governance
        |   RemoveAllSatelliteOracles(parameters)     -> removeAllSatelliteOracles(parameters, s)
        |   AddOracleToAggregator(parameters)         -> addOracleToAggregator(parameters, s)
        |   RemoveOracleInAggregator(parameters)      -> removeOracleInAggregator(parameters, s)

            // Aggregator Governance
        |   SetAggregatorMaintainer(parameters)       -> setAggregatorMaintainer(parameters, s)
        |   RegisterAggregator(parameters)            -> registerAggregator(parameters, s)
        |   UpdateAggregatorStatus(parameters)        -> updateAggregatorStatus(parameters, s)

            // Governance Actions
        |   DropAction(parameters)                    -> dropAction(parameters, s)
        |   VoteForAction(parameters)                 -> voteForAction(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                       -> setLambda(parameters, s)
    ]
)
