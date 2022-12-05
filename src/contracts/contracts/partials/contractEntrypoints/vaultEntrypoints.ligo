// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(* setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : vaultStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s);
    
    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : vaultStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : vaultStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Entrypoints Begin
// ------------------------------------------------------------------------------

(* delegateTezToBaker entrypoint *)
function delegateTezToBaker(const delegateParams : delegateTezToBakerType; var s : vaultStorageType) : return is 
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaDelegateTezToBaker", s);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaDelegateTezToBaker(delegateParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* delegateMvkToSatellite entrypoint *)
function delegateMvkToSatellite(const satelliteAddress : address; var s : vaultStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaDelegateMvkToSat", s);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaDelegateMvkToSat(satelliteAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* deposit entrypoint *)
function deposit(const depositParams : depositType; var s : vaultStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaDeposit", s);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaDeposit(depositParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* withdraw entrypoint *)
function withdraw(const withdrawParams : withdrawType; var s : vaultStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaWithdraw", s);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaWithdraw(withdrawParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* onLiquidate entrypoint *)
function onLiquidate(const onLiquidateParams : onLiquidateType; var s : vaultStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaOnLiquidate", s);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaOnLiquidate(onLiquidateParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* updateDepositor entrypoint *)
function updateDepositor(const updateDepositorParams : updateDepositorType; var s : vaultStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateDepositor", s);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaUpdateDepositor(updateDepositorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* updateMvkOperators entrypoint *)
function updateMvkOperators(const updateMvkOperatorsParams : updateOperatorsType; var s : vaultStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMvkOperators", s);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaUpdateMvkOperators(updateMvkOperatorsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : vaultStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
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
