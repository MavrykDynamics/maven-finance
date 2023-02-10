// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : vestingStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : vestingStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init council lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);

} with response



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : vestingStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : vestingStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : vestingStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : vestingStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s.lambdaLedger);

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Internal Vestee Control Entrypoints Begin
// ------------------------------------------------------------------------------

(*  addVestee entrypoint *)
function addVestee(const addVesteeParams : addVesteeType; var s : vestingStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaAddVestee", s.lambdaLedger);

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaAddVestee(addVesteeParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  
    
} with response



(*  removeVestee entrypoint *)
function removeVestee(const vesteeAddress : address; var s : vestingStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRemoveVestee", s.lambdaLedger);

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaRemoveVestee(vesteeAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  
    
} with response



(*  updateVestee entrypoint *)
function updateVestee(const updateVesteeParams : updateVesteeType; var s : vestingStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateVestee", s.lambdaLedger);

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaUpdateVestee(updateVesteeParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  

} with response



(*  toggleVesteeLock entrypoint *)
function toggleVesteeLock(const vesteeAddress : address; var s : vestingStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaToggleVesteeLock", s.lambdaLedger);

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaToggleVesteeLock(vesteeAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  
    
} with response

// ------------------------------------------------------------------------------
// Internal Vestee Control Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vestee Entrypoints Begin
// ------------------------------------------------------------------------------

(* claim entrypoint *)
function claim(var s : vestingStorageType) : return is 
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaClaim", s.lambdaLedger);

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaClaim(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Vestee Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : vestingStorageType) : return is
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