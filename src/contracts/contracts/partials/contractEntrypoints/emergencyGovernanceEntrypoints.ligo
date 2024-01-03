// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(* setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : emergencyGovernanceStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : emergencyGovernanceStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : emergencyGovernanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(* updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : emergencyUpdateConfigParamsType; var s : emergencyGovernanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s.lambdaLedger);

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(* updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : emergencyGovernanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : emergencyGovernanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : emergencyGovernanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s.lambdaLedger);

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Emergency Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(* triggerEmergencyControl entrypoint  *)
function triggerEmergencyControl(const triggerEmergencyControlParams : triggerEmergencyControlType; var s : emergencyGovernanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTriggerEmergencyControl", s.lambdaLedger);

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaTriggerEmergencyControl(triggerEmergencyControlParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(* voteForEmergencyControl entrypoint  *)
function voteForEmergencyControl(var s : emergencyGovernanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaVoteForEmergencyControl", s.lambdaLedger);

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaVoteForEmergencyControl(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Emergency Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : emergencyGovernanceStorageType) : return is
block{
    
    // verify that sender is admin
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
