// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(* setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : treasuryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : treasuryStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);

} with response



(* setBaker entrypoint *)
function setBaker(const keyHash : option(key_hash); var s : treasuryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetBaker", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaSetBaker(keyHash);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* setName entrypoint - update the metadata at a given key *)
function setName(const updatedName : string; var s : treasuryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetName", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaSetName(updatedName);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : treasuryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : treasuryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : treasuryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : treasuryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistTokenContracts", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s : treasuryStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPauseAll", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s : treasuryStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnpauseAll", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint: treasuryTogglePauseEntrypointType; const s : treasuryStorageType) : return is
block{
  
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTogglePauseEntrypoint", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);

} with response



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Treasury Entrypoints Begin
// ------------------------------------------------------------------------------

(* transfer entrypoint *)
function transfer(const transferTokenParams : transferActionType; var s : treasuryStorageType) : return is 
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTransfer", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaTransfer(transferTokenParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* mintMvkAndTransfer entrypoint *)
function mintMvkAndTransfer(const mintMvkAndTransferParams : mintMvkAndTransferType ; var s : treasuryStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMintMvkAndTransfer", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaMintMvkAndTransfer(mintMvkAndTransferParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* updateMvkOperators entrypoint *)
function updateMvkOperators(const updateOperatorsParams : updateOperatorsType ; var s : treasuryStorageType) : return is 
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMvkOperators", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUpdateMvkOperators(updateOperatorsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* stakeMvk entrypoint *)
function stakeMvk(const stakeAmount : nat ; var s : treasuryStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaStakeMvk", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaStakeMvk(stakeAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* unstakeMvk entrypoint *)
function unstakeMvk(const unstakeAmount : nat ; var s : treasuryStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnstakeMvk", s);

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUnstakeMvk(unstakeAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Treasury Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : treasuryStorageType) : return is
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