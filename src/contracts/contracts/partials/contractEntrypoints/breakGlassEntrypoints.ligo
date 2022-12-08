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
    const lambdaBytes : bytes = getLambdaBytes("lambdaBreakGlass", s);    

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
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s);
  
    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : breakGlassUpdateConfigParamsType; var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint  *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsType; var s: breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsType; var s: breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);  

} with response



(* updateCouncilMemberInfo entrypoint *)
function updateCouncilMemberInfo(const councilMemberInfo: councilMemberInfoType; var s : breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateCouncilMemberInfo", s);

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

(*  addCouncilMember entrypoint  *)
function addCouncilMember(const newCouncilMember : councilActionAddMemberType; var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaAddCouncilMember", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaAddCouncilMember(newCouncilMember);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  removeCouncilMember entrypoint  *)
function removeCouncilMember(const councilMemberAddress : address; var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRemoveCouncilMember", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaRemoveCouncilMember(councilMemberAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  changeCouncilMember entrypoint  *)
function changeCouncilMember(const changeCouncilMemberParams : councilActionChangeMemberType; var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaChangeCouncilMember", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaChangeCouncilMember(changeCouncilMemberParams);

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
function pauseAllEntrypoints(var s : breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPauseAllEntrypoints", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaPauseAllEntrypoints(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  unpauseAllEntrypoints entrypoint  *)
function unpauseAllEntrypoints(var s : breakGlassStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnpauseAllEntrypoints", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUnpauseAllEntrypoints(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  propagateBreakGlass entrypoint  *)
function propagateBreakGlass(var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPropagateBreakGlass", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaPropagateBreakGlass(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  setSingleContractAdmin entrypoint  *)
function setSingleContractAdmin(const setSingleContractAdminParams : setContractAdminType; var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetSingleContractAdmin", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetSingleContractAdmin(setSingleContractAdminParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  setAllContractsAdmin entrypoint  *)
function setAllContractsAdmin(const newAdminAddress : address; var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAllContractsAdmin", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetAllContractsAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  removeBreakGlassControl entrypoint  *)
function removeBreakGlassControl(var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRemoveBreakGlassControl", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaRemoveBreakGlassControl(unit);

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
    const lambdaBytes : bytes = getLambdaBytes("lambdaFlushAction", s);

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaFlushAction(actionId);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  signAction entrypoint  *)
function signAction(const actionId: nat; var s : breakGlassStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSignAction", s);

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