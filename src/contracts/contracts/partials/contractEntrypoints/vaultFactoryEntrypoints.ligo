// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : vaultFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : vaultFactoryStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);

} with response



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : vaultFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : vaultFactoryUpdateConfigParamsType; var s : vaultFactoryStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s.lambdaLedger);

    // init delegation lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : vaultFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : vaultFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : vaultFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s.lambdaLedger);

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAll entrypoint *)
function pauseAll(var s : vaultFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPauseAll", s.lambdaLedger);

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response



(*  unpauseAll entrypoint *)
function unpauseAll(var s : vaultFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnpauseAll", s.lambdaLedger);

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : vaultFactoryTogglePauseEntrypointType; const s : vaultFactoryStorageType) : return is
block{
  
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTogglePauseEntrypoint", s.lambdaLedger);

    // init vault Factory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Factory Entrypoints Begin
// ------------------------------------------------------------------------------

(* createVault entrypoint *)
function createVault(const createVaultParams : createVaultType; var s : vaultFactoryStorageType) : return is 
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCreateVault", s.lambdaLedger);

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaCreateVault(createVaultParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// vault Factory Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : vaultFactoryStorageType) : return is
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