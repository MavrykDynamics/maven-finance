// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint  *)
function setAdmin(const newAdminAddress: address; const s: aggregatorFactoryStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : aggregatorFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  updateMetadata entrypoint  *)
function updateMetadata(const updateMetadataParams: updateMetadataType; const s: aggregatorFactoryStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams: aggregatorFactoryUpdateConfigParamsType; const s: aggregatorFactoryStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsType; var s: aggregatorFactoryStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsType; var s: aggregatorFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: aggregatorFactoryStorageType): return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAll entrypoint *)
function pauseAll(var s: aggregatorFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPauseAll", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  unpauseAll entrypoint *)
function unpauseAll(var s: aggregatorFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnpauseAll", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);  

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint: aggregatorFactoryTogglePauseEntrypointType; const s: aggregatorFactoryStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTogglePauseEntrypoint", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Aggregator Factory Entrypoints Begin
// ------------------------------------------------------------------------------

(*  createAggregator entrypoint  *)
function createAggregator(const createAggregatorParams: createAggregatorParamsType; var s: aggregatorFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCreateAggregator", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaCreateAggregator(createAggregatorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  trackAggregator entrypoint  *)
function trackAggregator(const trackAggregatorParams: address; var s: aggregatorFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTrackAggregator", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaTrackAggregator(trackAggregatorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  untrackAggregator entrypoint  *)
function untrackAggregator(const untrackAggregatorParams: address; var s: aggregatorFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUntrackAggregator", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaUntrackAggregator(untrackAggregatorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Aggregator Factory Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Aggregator Entrypoints Begin
// ------------------------------------------------------------------------------

(*  distributeRewardMvrk entrypoint  *)
function distributeRewardMvrk(const distributeRewardMvrkParams : distributeRewardMvrkType; var s: aggregatorFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaDistributeRewardMvrk", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaDistributeRewardMvrk(distributeRewardMvrkParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response



(*  distributeRewardStakedMvn entrypoint  *)
function distributeRewardStakedMvn(const distributeRewardStakedMvnParams : distributeRewardStakedMvnType; var s: aggregatorFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaDistributeRewardStakedMvn", s.lambdaLedger);

    // init aggregator factory lambda action
    const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType = LambdaDistributeRewardStakedMvn(distributeRewardStakedMvnParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorFactoryLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Aggregator Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : aggregatorFactoryStorageType) : return is
block{
    
    // verify that sender is admin
    verifySenderIsAdmin(s.admin);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)



(* setProductLambda entrypoint *)
function setProductLambda(const setLambdaParams: setLambdaType; var s: aggregatorFactoryStorageType) : return is
block{
    
    // verify that sender is admin
    verifySenderIsAdmin(s.admin);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.aggregatorLambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------