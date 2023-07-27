// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(* setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : delegationStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);
    
    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : delegationStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : delegationStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : delegationUpdateConfigParamsType; var s : delegationStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : delegationStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : delegationStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : delegationStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s : delegationStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPauseAll", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s : delegationStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnpauseAll", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : delegationTogglePauseEntrypointType; const s : delegationStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTogglePauseEntrypoint", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Delegation Entrypoints Begin
// ------------------------------------------------------------------------------

(* delegateToSatellite entrypoint *)
function delegateToSatellite(const delegateToSatelliteParams : delegateToSatelliteType; var s : delegationStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaDelegateToSatellite", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaDelegateToSatellite(delegateToSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* undelegateFromSatellite entrypoint *)
function undelegateFromSatellite(const undelegateToSatelliteParams : address; var s : delegationStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUndelegateFromSatellite", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUndelegateFromSatellite(undelegateToSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Delegation Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Entrypoints Begin
// ------------------------------------------------------------------------------

(* registerAsSatellite entrypoint *)
function registerAsSatellite(const registerAsSatelliteParams : registerAsSatelliteParamsType; var s : delegationStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRegisterAsSatellite", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaRegisterAsSatellite(registerAsSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* unregisterAsSatellite entrypoint *)
function unregisterAsSatellite(const userAddress : address; var s : delegationStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnregisterAsSatellite", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUnregisterAsSatellite(userAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateSatelliteRecord entrypoint *)
function updateSatelliteRecord(const updateSatelliteRecordParams : updateSatelliteRecordType; var s : delegationStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateSatelliteRecord", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateSatelliteRecord(updateSatelliteRecordParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);
    
} with response



(* distributeReward entrypoint *)
function distributeReward(const distributeRewardParams : distributeRewardStakedMvkType; var s : delegationStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaDistributeReward", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaDistributeReward(distributeRewardParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);
    
} with response



(* takeSatellitesSnapshot entrypoint *)
function takeSatellitesSnapshot(const takeSatellitesSnapshotParams : takeSatellitesSnapshotType; var s : delegationStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTakeSatellitesSnapshot", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaTakeSatelliteSnapshot(takeSatellitesSnapshotParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Satellite Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Entrypoints Begin
// ------------------------------------------------------------------------------

(* onStakeChange entrypoint *)
function onStakeChange(const userAddresses : onStakeChangeType; var s : delegationStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaOnStakeChange", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaOnStakeChange(userAddresses);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateSatelliteStatus entrypoint *)
function updateSatelliteStatus(const updateSatelliteStatusParams : updateSatelliteStatusParamsType; var s : delegationStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateSatelliteStatus", s.lambdaLedger);

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateSatelliteStatus(updateSatelliteStatusParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// General Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : delegationStorageType) : return is
block{
    
    // Verify that sender is admin
    verifySenderIsAdmin(s.admin);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
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