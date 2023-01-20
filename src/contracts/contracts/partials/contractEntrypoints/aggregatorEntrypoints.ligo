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

(*  withdrawRewardXtz entrypoint  *)
function withdrawRewardXtz(const receiver: address; const s : aggregatorStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaWithdrawRewardXtz", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaWithdrawRewardXtz(receiver);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response


(*  withdrawRewardStakedMvk entrypoint  *)
function withdrawRewardStakedMvk(const receiver: address; const s : aggregatorStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaWithdrawRewardStakedMvk", s.lambdaLedger);

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaWithdrawRewardStakedMvk(receiver);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Reward Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* executeGovernanceAction entrypoint *)
function executeGovernanceAction(const governanceActionBytes : bytes; var s : aggregatorStorageType) : return is
block{
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    // // Fourth Way
    const executeGovernanceAction : aggregatorLambdaActionType = case (Bytes.unpack(governanceActionBytes) : option(aggregatorLambdaActionType)) of [
            Some(_action) -> _action
        |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
    ];

    const response : return = case executeGovernanceAction of [
      
            // Housekeeping
        |   LambdaSetAdmin (parameters)                 -> setAdmin(parameters, s)
        |   LambdaSetGovernance(parameters)             -> setGovernance(parameters, s)
        |   LambdaSetName(parameters)                   -> setName(parameters, s)
        |   LambdaUpdateMetadata(parameters)            -> updateMetadata(parameters, s)
        |   LambdaUpdateConfig(parameters)              -> updateConfig(parameters, s)
        |   LambdaUpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
        |   LambdaUpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
        |   LambdaMistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)

            // Oracle Entrypoints
        |   LambdaAddOracle (parameters)                -> addOracle(parameters, s)
        |   LambdaRemoveOracle(parameters)              -> removeOracle(parameters, s)

            // Pause / Break Glass Entrypoints
        |   LambdaPauseAll(_parameters)                 -> pauseAll(s)
        |   LambdaUnpauseAll(_parameters)               -> unpauseAll(s)
        |   LambdaTogglePauseEntrypoint(parameters)     -> togglePauseEntrypoint(parameters, s)

        |   _                                           -> (nil, s)
    ];

} with (response)



(* dataPackingHelper entrypoint - to simulate calling an entrypoint *)
function dataPackingHelper(const _executeGovernanceAction : aggregatorLambdaActionType; const s : aggregatorStorageType) : return is 
    (noOperations, s)



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
