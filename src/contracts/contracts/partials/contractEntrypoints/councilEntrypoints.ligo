// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : councilStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : councilStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);
    
    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : councilStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : councilUpdateConfigParamsType; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint  *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : councilStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : councilStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateCouncilMemberInfo entrypoint - update the info of a council member *)
function updateCouncilMemberInfo(const councilMemberInfo : councilMemberInfoType; var s : councilStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateCouncilMemberInfo", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateCouncilMemberInfo(councilMemberInfo);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Actions for Internal Control Entrypoints Begin
// ------------------------------------------------------------------------------

(*  councilActionAddMember entrypoint  *)
function councilActionAddMember(const newCouncilMember : councilActionAddMemberType ; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilAddMember", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilAddMember(newCouncilMember);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionRemoveMember entrypoint  *)
function councilActionRemoveMember(const councilMemberAddress : address ; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilRemoveMember", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilRemoveMember(councilMemberAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionChangeMember entrypoint  *)
function councilActionChangeMember(const councilActionChangeMemberParams : councilActionChangeMemberType; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilChangeMember", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilChangeMember(councilActionChangeMemberParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionSetBaker entrypoint  *)
function councilActionSetBaker(const councilActionSetBakerParams : setBakerType; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilSetBaker", s.lambdaLedger);
    
    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilSetBaker(councilActionSetBakerParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council Actions for Internal Control Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Actions for Vesting Entrypoints Begin
// ------------------------------------------------------------------------------

(*  councilActionAddVestee entrypoint  *)
function councilActionAddVestee(const addVesteeParams : addVesteeType ; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilAddVestee", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilAddVestee(addVesteeParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionRemoveVestee entrypoint  *)
function councilActionRemoveVestee(const vesteeAddress : address ; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilRemoveVestee", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilRemoveVestee(vesteeAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionUpdateVestee entrypoint  *)
function councilActionUpdateVestee(const updateVesteeParams : updateVesteeType; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilUpdateVestee", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilUpdateVestee(updateVesteeParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionToggleVesteeLock entrypoint  *)
function councilActionToggleVesteeLock(const vesteeAddress : address ; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilToggleVesteeLock", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilToggleVesteeLock(vesteeAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council Actions for Vesting Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Actions for Financial Governance Begin
// ------------------------------------------------------------------------------

(*  councilActionTransfer entrypoint  *)
function councilActionTransfer(const councilActionTransferParams : councilActionTransferType; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilTransfer", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilTransfer(councilActionTransferParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionRequestTokens entrypoint  *)
function councilActionRequestTokens(const councilActionRequestTokensParams : councilActionRequestTokensType ; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilRequestTokens", s.lambdaLedger);
    
    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilRequestTokens(councilActionRequestTokensParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionRequestMint entrypoint  *)
function councilActionRequestMint(const councilActionRequestMintParams : councilActionRequestMintType ; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilRequestMint", s.lambdaLedger);
    
    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilRequestMint(councilActionRequestMintParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionSetContractBaker entrypoint  *)
function councilActionSetContractBaker(const councilActionSetContractBakerParams : councilActionSetContractBakerType ; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilSetContractBaker", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilSetContractBaker(councilActionSetContractBakerParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionDropFinancialRequest entrypoint  *)
function councilActionDropFinancialRequest(const requestId : nat ; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCouncilDropFinancialReq", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilDropFinancialReq(requestId);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council Actions for Financial Governance End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Signing of Actions Entrypoints Begin
// ------------------------------------------------------------------------------

(*  flushAction entrypoint  *)
function flushAction(const actionId : actionIdType; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaFlushAction", s.lambdaLedger);

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaFlushAction(actionId);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  signAction entrypoint  *)
function signAction(const actionId : actionIdType; var s : councilStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSignAction", s.lambdaLedger);
    
    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaSignAction(actionId);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council Signing of Actions Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : councilStorageType) : return is
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