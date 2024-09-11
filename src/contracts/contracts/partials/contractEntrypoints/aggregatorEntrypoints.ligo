// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint  *)
function setAdmin(const newAdminAddress : address; const s : aggregatorStorageType) : return is
block{
  
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : aggregatorStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  setName entrypoint *)
function setName(const newContractName : string; var s : aggregatorStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetName", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaSetName(newContractName);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  updateMetadata entrypoint  *)
function updateMetadata(const updateMetadataParams : updateMetadataType; const s : aggregatorStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : aggregatorUpdateConfigParamsType; const s : aggregatorStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : aggregatorStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : aggregatorStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: aggregatorStorageType): return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Admin Oracle Entrypoints Begin
// ------------------------------------------------------------------------------

(*  addOracle entrypoint  *)
function addOracle(const addOracleParams : addOracleType; const s : aggregatorStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaAddOracle", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaAddOracle(addOracleParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  updateOracle entrypoint  *)
function updateOracle(const s : aggregatorStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateOracle", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateOracle(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  removeOracle entrypoint  *)
function removeOracle(const oracleAddress : address; const s : aggregatorStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRemoveOracle", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaRemoveOracle(oracleAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Oracle Admin Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAll entrypoint  *)
function pauseAll(const s : aggregatorStorageType) : return is
block{
  
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPauseAll", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  unpauseAll entrypoint  *)
function unpauseAll(const s : aggregatorStorageType) : return is
block{
  
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnpauseAll", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint: aggregatorTogglePauseEntrypointType; const s : aggregatorStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTogglePauseEntrypoint", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Oracle Entrypoints Begin
// ------------------------------------------------------------------------------

(*  updateData entrypoint  *)
function updateData(const params : updateDataType; const s : aggregatorStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateData", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateData(params);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Oracle Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Reward Entrypoints Begin
// ------------------------------------------------------------------------------

(*  withdrawRewardMvrk entrypoint  *)
function withdrawRewardMvrk(const receiver: address; const s : aggregatorStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaWithdrawRewardMvrk", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaWithdrawRewardMvrk(receiver);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response


(*  withdrawRewardStakedMvn entrypoint  *)
function withdrawRewardStakedMvn(const receiver: address; const s : aggregatorStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaWithdrawRewardStakedMvn", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaWithdrawRewardStakedMvn(receiver);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Reward Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : aggregatorStorageType) : return is
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
