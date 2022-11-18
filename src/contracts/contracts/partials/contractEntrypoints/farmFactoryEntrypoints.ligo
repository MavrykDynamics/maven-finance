// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : farmFactoryStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s);

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : farmFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s);

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);

} with response



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : farmFactoryStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s);

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : farmFactoryUpdateConfigParamsType; var s : farmFactoryStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s);

    // init delegation lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : farmFactoryStorageType) : return is
block {
        
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s);

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : farmFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s);

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : farmFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s);

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAll entrypoint *)
function pauseAll(var s : farmFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPauseAll", s);

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  unpauseAll entrypoint *)
function unpauseAll(var s : farmFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnpauseAll", s);

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : farmFactoryTogglePauseEntrypointType; const s : farmFactoryStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTogglePauseEntrypoint", s);

    // init farm factory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);

} with response



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Factory Entrypoints Begin
// ------------------------------------------------------------------------------

(* createFarm entrypoint *)
function createFarm(const createFarmParams : createFarmType; var s : farmFactoryStorageType) : return is 
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCreateFarm", s);

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaCreateFarm(createFarmParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(* trackFarm entrypoint *)
function trackFarm (const farmContract : address; var s : farmFactoryStorageType) : return is 
block{
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTrackFarm", s);

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaTrackFarm(farmContract);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response



(* untrackFarm entrypoint *)
function untrackFarm (const farmContract : address; var s : farmFactoryStorageType) : return is 
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUntrackFarm", s);

    // init farmFactory lambda action
    const farmFactoryLambdaAction : farmFactoryLambdaActionType = LambdaUntrackFarm(farmContract);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Farm Factory Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : farmFactoryStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)



(* setProductLambda entrypoint *)
function setProductLambda(const setLambdaParams : setLambdaType; var s : farmFactoryStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.farmLambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------