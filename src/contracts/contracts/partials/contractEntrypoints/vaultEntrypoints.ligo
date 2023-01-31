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
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);
    
    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : vaultStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : vaultStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

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
    const lambdaBytes : bytes = getLambdaBytes("lambdaDelegateTezToBaker", s.lambdaLedger);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaDelegateTezToBaker(delegateParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* delegateMvkToSatellite entrypoint *)
function delegateMvkToSatellite(const satelliteAddress : address; var s : vaultStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaDelegateMvkToSat", s.lambdaLedger);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaDelegateMvkToSat(satelliteAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* deposit entrypoint *)
function deposit(const depositParams : depositType; var s : vaultStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaDeposit", s.lambdaLedger);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaDeposit(depositParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* withdraw entrypoint *)
function withdraw(const withdrawParams : withdrawType; var s : vaultStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaWithdraw", s.lambdaLedger);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaWithdraw(withdrawParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* onLiquidate entrypoint *)
function onLiquidate(const onLiquidateParams : onLiquidateType; var s : vaultStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaOnLiquidate", s.lambdaLedger);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaOnLiquidate(onLiquidateParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* updateDepositor entrypoint *)
function updateDepositor(const updateDepositorParams : updateDepositorType; var s : vaultStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateDepositor", s.lambdaLedger);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaUpdateDepositor(updateDepositorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* updateTokenOperators entrypoint *)
function updateTokenOperators(const updateTokenOperatorsParams : updateTokenOperatorsType; var s : vaultStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateTokenOperators", s.lambdaLedger);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaUpdateTokenOperators(updateTokenOperatorsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------


(* executeGovernanceAction entrypoint *)
function executeGovernanceAction(const governanceActionBytes : bytes; var s : vaultStorageType) : return is
block{
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaExecuteGovernanceAction", s.lambdaLedger);

    // init vault lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaExecuteGovernanceAction(governanceActionBytes);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with (response)



(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : vaultStorageType) : return is
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
