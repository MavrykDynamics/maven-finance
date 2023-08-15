// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Break Glass Entrypoint Begin
// ------------------------------------------------------------------------------

(*  breakGlass entrypoint *)
function breakGlass(var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaBreakGlass", s.lambdaLedger);    

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaBreakGlass(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Break Glass Entrypoint End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);
  
    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : breakGlassUpdateConfigParamsType; var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint  *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsType; var s: breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsType; var s: breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);  

} with response



(* updateCouncilMemberInfo entrypoint *)
function updateCouncilMemberInfo(const councilMemberInfo: councilMemberInfoType; var s : breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateCouncilMemberInfo", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateCouncilMemberInfo(councilMemberInfo);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Break Glass Council Actions Begin - Internal Control of Council Members
// ------------------------------------------------------------------------------

(*  councilActionAddMember entrypoint  *)
function councilActionAddMember(const newCouncilMember : councilActionAddMemberType; var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilAddMember", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaCouncilAddMember(newCouncilMember);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  councilActionRemoveMember entrypoint  *)
function councilActionRemoveMember(const councilMemberAddress : address; var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilRemoveMember", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaCouncilRemoveMember(councilMemberAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  councilActionChangeMember entrypoint  *)
function councilActionChangeMember(const councilActionChangeMemberParams : councilActionChangeMemberType; var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilChangeMember", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaCouncilChangeMember(councilActionChangeMemberParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Break Glass Council Actions End - Internal Control of Council Members
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Glass Broken Required Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAllEntrypoints entrypoint  *)
function pauseAllEntrypoints(const pauseAllEntrypointsParams : set(address); var s : breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPauseAllEntrypoints", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaPauseAllEntrypoints(pauseAllEntrypointsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  unpauseAllEntrypoints entrypoint  *)
function unpauseAllEntrypoints(const unpauseAllEntrypointsParams : set(address); var s : breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnpauseAllEntrypoints", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUnpauseAllEntrypoints(unpauseAllEntrypointsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  propagateBreakGlass entrypoint  *)
function propagateBreakGlass(const propagateBreakGlassParams : set(address); var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPropagateBreakGlass", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaPropagateBreakGlass(propagateBreakGlassParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  setContractsAdmin entrypoint  *)
function setContractsAdmin(const setContractsAdminParams : setContractsAdminType; var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetContractsAdmin", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetContractsAdmin(setContractsAdminParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  removeBreakGlassControl entrypoint  *)
function removeBreakGlassControl(const removeBreakGlassControl : set(address); var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRemoveBreakGlassControl", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaRemoveBreakGlassControl(removeBreakGlassControl);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Glass Broken Required Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Signing of Actions Entrypoints Begin
// ------------------------------------------------------------------------------

(*  flushAction entrypoint  *)
function flushAction(const actionId: actionIdType; var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaFlushAction", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaFlushAction(actionId);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  signAction entrypoint  *)
function signAction(const actionId: nat; var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSignAction", s.lambdaLedger);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSignAction(actionId);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council signing of actions Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: breakGlassStorageType) : return is
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